import pytest
from app.model_store import list_models, get_active_model_id, get_model, _ACTIVE_MODEL_CACHE

def test_list_models_returns_list():
    models = list_models()
    assert isinstance(models, list)
    if len(models) > 0:
        first = models[0]
        assert "id" in first
        assert "version" in first
        assert "algorithm" in first
        assert "accuracy" in first

def test_get_active_model_id_is_valid():
    active_id = get_active_model_id()
    assert active_id is not None
    assert isinstance(active_id, str)
    assert active_id.startswith("model_")

def test_get_active_model_metadata():
    active_id = get_active_model_id()
    meta = get_model(active_id)
    assert meta is not None
    assert meta["id"] == active_id
    assert "classes" in meta
    assert "f1_score" in meta
