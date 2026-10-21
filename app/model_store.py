import os
import json
import joblib
import hashlib
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from app.config import MODELS_DIR, ACTIVE_MODEL_POINTER, DATASETS_DIR

_ACTIVE_MODEL_CACHE = {
    "model_id": None,
    "pipeline": None,
    "metadata": None
}

# Quality Gate Promotion Thresholds
QUALITY_GATE_MIN_ACCURACY = 0.65
QUALITY_GATE_MIN_F1 = 0.60

def get_git_commit_hash() -> str:
    """Retrieve current Git commit SHA-1 if running in a Git repository."""
    try:
        commit = subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            stderr=subprocess.DEVNULL,
            text=True
        ).strip()
        return commit or "git-baseline"
    except Exception:
        return "unknown"

def compute_dataset_hash(dataset_name: str) -> str:
    """Compute SHA256 checksum of dataset file for lineage tracking."""
    try:
        path = DATASETS_DIR / dataset_name
        if path.exists() and path.is_file():
            hasher = hashlib.sha256()
            with open(path, "rb") as f:
                while chunk := f.read(65536):
                    hasher.update(chunk)
            return hasher.hexdigest()[:16]
    except Exception:
        pass
    return "unknown"

def save_model(
    pipeline: Any,
    metrics: Dict[str, Any],
    dataset_name: str,
    text_col: str,
    label_col: str,
    custom_name: Optional[str] = None,
    parameters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    # Determine next version tag
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
    git_commit = get_git_commit_hash()
    data_hash = compute_dataset_hash(dataset_name)

    acc = metrics.get("accuracy", 0.0)
    f1 = metrics.get("f1_score", 0.0)
    macro_f1 = metrics.get("macro_f1", f1)

    # Initial lifecycle status is Candidate
    status = "Candidate"
    # Pre-validate against quality gate thresholds
    if acc >= QUALITY_GATE_MIN_ACCURACY and f1 >= QUALITY_GATE_MIN_F1:
        status = "Validated"

    metadata = {
        "id": model_id,
        "name": display_name,
        "version": version_tag,
        "model_version": version_tag,
        "status": status,
        "git_commit": git_commit,
        "dataset_name": dataset_name,
        "dataset_version": data_hash,
        "dataset_hash": data_hash,
        "algorithm": metrics.get("algorithm"),
        "algorithm_key": metrics.get("algorithm_key"),
        "parameters": parameters or {"ngram_range": [1, 2], "max_features": 15000},
        "text_column": text_col,
        "label_column": label_col,
        "classes": metrics.get("classes", []),
        "accuracy": round(float(acc), 4),
        "precision": round(float(metrics.get("precision", 0.0)), 4),
        "recall": round(float(metrics.get("recall", 0.0)), 4),
        "f1_score": round(float(f1), 4),
        "macro_f1": round(float(macro_f1), 4),
        "train_samples": metrics.get("train_samples"),
        "test_samples": metrics.get("test_samples"),
        "confusion_matrix": metrics.get("confusion_matrix"),
        "class_distribution": metrics.get("class_distribution"),
        "detailed_report": metrics.get("detailed_report"),
        "created_at": datetime.now().isoformat(),
        "is_active": False
    }

    # If no active model exists, automatically deploy first model
    if not ACTIVE_MODEL_POINTER.exists():
        metadata["is_active"] = True
        metadata["status"] = "Deployed"
        with open(ACTIVE_MODEL_POINTER, "w", encoding="utf-8") as f:
            json.dump({
                "active_model_id": model_id,
                "previous_model_id": None,
                "promoted_at": datetime.now().isoformat()
            }, f, indent=2)
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
                        if meta["is_active"]:
                            meta["status"] = "Deployed"
                        elif "status" not in meta:
                            meta["status"] = "Archived"
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
        if meta["is_active"]:
            meta["status"] = "Deployed"
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

def get_previous_model_id() -> Optional[str]:
    if ACTIVE_MODEL_POINTER.exists():
        try:
            with open(ACTIVE_MODEL_POINTER, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("previous_model_id")
        except Exception:
            pass
    return None

def promote_model(model_id: str) -> Dict[str, Any]:
    """
    MLOps Quality Gate & Promotion:
    Validates model quality metrics against threshold.
    Preserves last known-good model for instant rollback.
    Promotes Candidate/Validated model to Deployed.
    """
    meta = get_model(model_id)
    if not meta:
        raise ValueError(f"Model '{model_id}' does not exist.")

    # Quality Gate Check
    acc = meta.get("accuracy", 0.0)
    f1 = meta.get("f1_score", 0.0)
    if acc < QUALITY_GATE_MIN_ACCURACY or f1 < QUALITY_GATE_MIN_F1:
        # Mark as Rejected
        meta["status"] = "Rejected"
        meta_file = MODELS_DIR / model_id / "metadata.json"
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)
        raise ValueError(
            f"Quality Gate FAILED: Model '{model_id}' has Accuracy {acc:.4f} / F1 {f1:.4f}, "
            f"which fails required threshold (Acc >= {QUALITY_GATE_MIN_ACCURACY}, F1 >= {QUALITY_GATE_MIN_F1}). "
            f"Model status set to 'Rejected'. Promotion blocked!"
        )

    current_active_id = get_active_model_id()

    # Update previous active model status to Archived
    if current_active_id and current_active_id != model_id:
        old_meta = get_model(current_active_id)
        if old_meta:
            old_meta["status"] = "Archived"
            old_meta_file = MODELS_DIR / current_active_id / "metadata.json"
            with open(old_meta_file, "w", encoding="utf-8") as f:
                json.dump(old_meta, f, indent=2)

    # Set new active model pointer with rollback history
    with open(ACTIVE_MODEL_POINTER, "w", encoding="utf-8") as f:
        json.dump({
            "active_model_id": model_id,
            "previous_model_id": current_active_id,
            "promoted_at": datetime.now().isoformat()
        }, f, indent=2)

    # Update metadata to Deployed
    meta["status"] = "Deployed"
    meta["is_active"] = True
    meta_file = MODELS_DIR / model_id / "metadata.json"
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    # Invalidate cache
    _ACTIVE_MODEL_CACHE["model_id"] = None
    _ACTIVE_MODEL_CACHE["pipeline"] = None
    _ACTIVE_MODEL_CACHE["metadata"] = None

    return {
        "status": "SUCCESS",
        "message": f"Model '{model_id}' successfully passed Quality Gate and is now Deployed.",
        "deployed_model_id": model_id,
        "previous_known_good_id": current_active_id,
        "metrics": {
            "accuracy": acc,
            "f1_score": f1
        }
    }

def rollback_model() -> Dict[str, Any]:
    """
    MLOps Rollback:
    Restores the last known-good model version if current active model encounters issues.
    """
    prev_id = get_previous_model_id()
    current_id = get_active_model_id()

    if not prev_id:
        # Fallback to finding the highest version previous model
        models = [m for m in list_models() if m.get("id") != current_id]
        if not models:
            raise ValueError("No previous known-good model available for rollback.")
        prev_id = models[0]["id"]

    prev_meta = get_model(prev_id)
    if not prev_meta:
        raise ValueError(f"Previous model artifact '{prev_id}' is corrupt or missing.")

    # Swap active pointer
    with open(ACTIVE_MODEL_POINTER, "w", encoding="utf-8") as f:
        json.dump({
            "active_model_id": prev_id,
            "previous_model_id": current_id,
            "rolled_back_at": datetime.now().isoformat()
        }, f, indent=2)

    # Update metadata statuses
    prev_meta["status"] = "Deployed"
    prev_meta["is_active"] = True
    with open(MODELS_DIR / prev_id / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(prev_meta, f, indent=2)

    # Invalidate cache
    _ACTIVE_MODEL_CACHE["model_id"] = None
    _ACTIVE_MODEL_CACHE["pipeline"] = None
    _ACTIVE_MODEL_CACHE["metadata"] = None

    return {
        "status": "SUCCESS",
        "message": f"Successfully rolled back to last known-good model: '{prev_id}'.",
        "active_model_id": prev_id,
        "rolled_back_from": current_id
    }

def activate_model(model_id: str) -> bool:
    try:
        promote_model(model_id)
        return True
    except Exception:
        model_dir = MODELS_DIR / model_id
        if not model_dir.exists():
            return False
        with open(ACTIVE_MODEL_POINTER, "w", encoding="utf-8") as f:
            json.dump({"active_model_id": model_id, "previous_model_id": get_active_model_id()}, f, indent=2)
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

load_active_model = get_active_pipeline_and_metadata
