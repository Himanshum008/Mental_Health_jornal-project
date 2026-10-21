import shutil
from pathlib import Path
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import DATASETS_DIR
from app.dataset_processor import inspect_csv, validate_and_preprocess_dataset
from app.model_trainer import train_and_evaluate_model
from app.model_store import save_model, list_models, get_model, activate_model, get_active_model_id
from app.predictor import predict_mood

app = FastAPI(
    title="Mental Health Journal - ML Service",
    description="Machine Learning service for training sentiment/emotion classifiers and real-time journal mood inference.",
    version="1.0.0"
)

# Enable CORS for Spring Boot (port 8080) and React frontend (port 5173 / 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Pydantic Models -----------------
class ValidateRequest(BaseModel):
    text_column: str
    label_column: str

class TrainRequest(BaseModel):
    dataset_name: str
    text_column: str
    label_column: str
    algorithm: str = "LOGISTIC_REGRESSION"
    test_size: float = 0.2
    model_name: Optional[str] = None

class PredictRequest(BaseModel):
    text: str

# ----------------- Health Check -----------------
@app.get("/health")
def health_check():
    active_id = get_active_model_id()
    return {
        "status": "UP",
        "service": "Mental Health Journal ML API",
        "active_model_id": active_id
    }

# ----------------- Datasets APIs -----------------
@app.post("/api/ml/datasets/upload")
def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    file_path = DATASETS_DIR / file.filename
    try:
        content = file.file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    inspection = inspect_csv(file_path)
    file_size = file_path.stat().st_size

    return {
        "dataset_name": file.filename,
        "file_size_bytes": file_size,
        "file_size_formatted": f"{file_size / 1024:.1f} KB",
        **inspection
    }

@app.get("/api/ml/datasets")
def get_datasets():
    datasets = []
    if DATASETS_DIR.exists():
        for f in DATASETS_DIR.iterdir():
            if f.is_file() and f.suffix.lower() == ".csv":
                try:
                    meta = inspect_csv(f)
                    datasets.append({
                        "name": f.name,
                        "size_bytes": f.stat().st_size,
                        "modified_at": f.stat().st_mtime,
                        "rows": meta["total_rows"],
                        "columns": meta["columns"],
                        "suggested_text": meta.get("suggested_text_column"),
                        "suggested_label": meta.get("suggested_label_column")
                    })
                except Exception:
                    pass
    return datasets

@app.get("/api/ml/datasets/{dataset_name}")
def get_dataset_details(dataset_name: str):
    file_path = DATASETS_DIR / dataset_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    return inspect_csv(file_path)

@app.post("/api/ml/datasets/{dataset_name}/validate")
def validate_dataset(dataset_name: str, payload: ValidateRequest):
    file_path = DATASETS_DIR / dataset_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        result = validate_and_preprocess_dataset(file_path, payload.text_column, payload.label_column)
        # Exclude raw DataFrame from JSON response
        del result["df"]
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

# ----------------- Model Training APIs -----------------
@app.post("/api/ml/train")
def train_model(payload: TrainRequest):
    file_path = DATASETS_DIR / payload.dataset_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Dataset '{payload.dataset_name}' not found.")

    try:
        preprocessed = validate_and_preprocess_dataset(
            file_path, payload.text_column, payload.label_column
        )
        df_clean = preprocessed["df"]

        pipeline, metrics = train_and_evaluate_model(
            df=df_clean,
            text_col=payload.text_column,
            label_col=payload.label_column,
            algorithm=payload.algorithm,
            test_size=payload.test_size
        )

        metadata = save_model(
            pipeline=pipeline,
            metrics=metrics,
            dataset_name=payload.dataset_name,
            text_col=payload.text_column,
            label_col=payload.label_column,
            custom_name=payload.model_name
        )

        # Automatically activate the newly trained model for immediate live inference
        activate_model(metadata["id"])
        metadata["is_active"] = True

        return {
            "message": f"Model '{metadata.get('name')}' successfully trained, evaluated, and activated for live journal predictions!",
            "model": metadata,
            "active_model_id": metadata["id"]
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")

# ----------------- Models & Versioning APIs -----------------
@app.get("/api/ml/models")
def get_all_models():
    return list_models()

@app.get("/api/ml/models/{model_id}")
def get_model_details(model_id: str):
    model = get_model(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model version not found.")
    return model

@app.post("/api/ml/models/{model_id}/activate")
def set_active_model(model_id: str):
    success = activate_model(model_id)
    if not success:
        raise HTTPException(status_code=404, detail="Model version could not be activated.")
    return {
        "message": f"Model '{model_id}' is now active for predictions!",
        "active_model_id": model_id
    }

# ----------------- Real-Time Prediction API -----------------
@app.post("/api/ml/predict")
def predict_journal_mood(payload: PredictRequest):
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty.")
    try:
        result = predict_mood(payload.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
