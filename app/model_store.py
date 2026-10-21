import os
import json
import joblib
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.config import MODELS_DIR, ACTIVE_MODEL_POINTER

_ACTIVE_MODEL_CACHE = {
    "model_id": None,
    "pipeline": None,
    "metadata": None
}

def save_model(
    pipeline: Any,
    metrics: Dict[str, Any],
    dataset_name: str,
    text_col: str,
    label_col: str,
    custom_name: Optional[str] = None
) -> Dict[str, Any]:
    # Determine version tag
    existing_models = list_models()
    next_ver_num = len(existing_models) + 1
    version_tag = f"v{next_ver_num}.0"
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_id = f"model_{timestamp}_{version_tag}"
    model_dir = MODELS_DIR / model_id
    model_dir.mkdir(parents=True, exist_ok=True)

    artifact_file = model_dir / "model.joblib"
    joblib.dump(pipeline, artifact_file)

    display_name = custom_name or f"{metrics.get('algorithm', 'Model')} ({version_tag})"

    metadata = {
        "id": model_id,
        "name": display_name,
        "version": version_tag,
        "algorithm": metrics.get("algorithm"),
        "algorithm_key": metrics.get("algorithm_key"),
        "dataset_name": dataset_name,
        "text_column": text_col,
        "label_column": label_col,
        "classes": metrics.get("classes", []),
        "accuracy": metrics.get("accuracy"),
        "precision": metrics.get("precision"),
        "recall": metrics.get("recall"),
        "f1_score": metrics.get("f1_score"),
        "train_samples": metrics.get("train_samples"),
        "test_samples": metrics.get("test_samples"),
        "confusion_matrix": metrics.get("confusion_matrix"),
        "class_distribution": metrics.get("class_distribution"),
        "detailed_report": metrics.get("detailed_report"),
        "created_at": datetime.now().isoformat(),
        "is_active": False
    }

    # If this is the first model, automatically activate it!
    if not ACTIVE_MODEL_POINTER.exists():
        metadata["is_active"] = True
        with open(ACTIVE_MODEL_POINTER, "w", encoding="utf-8") as f:
            json.dump({"active_model_id": model_id}, f, indent=2)
        _ACTIVE_MODEL_CACHE["model_id"] = model_id
        _ACTIVE_MODEL_CACHE["pipeline"] = pipeline
        _ACTIVE_MODEL_CACHE["metadata"] = metadata

    meta_file = model_dir / "metadata.json"
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    return metadata

def list_models() -> List[Dict[str, Any]]:
    active_id = get_active_model_id()
    models = []
    if not MODELS_DIR.exists():
        return models

    for item in MODELS_DIR.iterdir():
        if item.is_dir():
            meta_path = item / "metadata.json"
            if meta_path.exists():
                try:
                    with open(meta_path, "r", encoding="utf-8") as f:
                        meta = json.load(f)
                        meta["is_active"] = (meta.get("id") == active_id)
                        models.append(meta)
                except Exception:
                    pass

    # Sort newest first
    models.sort(key=lambda m: m.get("created_at", ""), reverse=True)
    return models

def get_model(model_id: str) -> Optional[Dict[str, Any]]:
    model_dir = MODELS_DIR / model_id
    meta_path = model_dir / "metadata.json"
    if not meta_path.exists():
        return None
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)
        meta["is_active"] = (meta.get("id") == get_active_model_id())
        return meta

def get_active_model_id() -> Optional[str]:
    if ACTIVE_MODEL_POINTER.exists():
        try:
            with open(ACTIVE_MODEL_POINTER, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("active_model_id")
        except Exception:
            pass
    return None

def activate_model(model_id: str) -> bool:
    model_dir = MODELS_DIR / model_id
    if not model_dir.exists() or not (model_dir / "model.joblib").exists():
        return False

    with open(ACTIVE_MODEL_POINTER, "w", encoding="utf-8") as f:
        json.dump({"active_model_id": model_id}, f, indent=2)

    # Invalidate cache
    _ACTIVE_MODEL_CACHE["model_id"] = None
    _ACTIVE_MODEL_CACHE["pipeline"] = None
    _ACTIVE_MODEL_CACHE["metadata"] = None

    return True

def get_active_pipeline_and_metadata():
    active_id = get_active_model_id()
    if not active_id:
        return None, None

    if _ACTIVE_MODEL_CACHE["model_id"] == active_id and _ACTIVE_MODEL_CACHE["pipeline"] is not None:
        return _ACTIVE_MODEL_CACHE["pipeline"], _ACTIVE_MODEL_CACHE["metadata"]

    model_dir = MODELS_DIR / active_id
    joblib_path = model_dir / "model.joblib"
    meta_path = model_dir / "metadata.json"

    if not joblib_path.exists() or not meta_path.exists():
        return None, None

    pipeline = joblib.load(joblib_path)
    with open(meta_path, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    _ACTIVE_MODEL_CACHE["model_id"] = active_id
    _ACTIVE_MODEL_CACHE["pipeline"] = pipeline
    _ACTIVE_MODEL_CACHE["metadata"] = metadata

    return pipeline, metadata
