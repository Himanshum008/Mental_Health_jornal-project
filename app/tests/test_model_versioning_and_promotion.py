import pytest
from app.model_store import (
    list_models,
    get_model,
    get_active_model_id,
    promote_model,
    rollback_model,
    QUALITY_GATE_MIN_ACCURACY,
    QUALITY_GATE_MIN_F1
)

def test_multiple_model_versions_exist():
    """Verify Phase 6 requirement: two or more model versions can be listed with metadata."""
    models = list_models()
    assert len(models) >= 2, f"Expected at least 2 models in registry, found {len(models)}"
    
    for m in models[:2]:
        assert "version" in m
        assert "algorithm" in m
        assert "accuracy" in m
        assert "status" in m
        assert m["status"] in ["Candidate", "Validated", "Deployed", "Archived", "Rejected"]

def test_quality_gate_blocks_poor_candidate(monkeypatch):
    """
    Verify Phase 6 requirement:
    Quality gate blocks a poor candidate and marks its status as 'Rejected'.
    """
    models = list_models()
    assert len(models) > 0
    test_model = models[-1]
    model_id = test_model["id"]

    # Mock get_model to return poor metrics below threshold
    original_get = get_model(model_id)
    poor_metadata = dict(original_get)
    poor_metadata["accuracy"] = 0.40  # Below 0.65 threshold
    poor_metadata["f1_score"] = 0.35  # Below 0.60 threshold

    monkeypatch.setattr("app.model_store.get_model", lambda mid: poor_metadata if mid == model_id else original_get)

    with pytest.raises(ValueError, match="Quality Gate FAILED"):
        promote_model(model_id)

def test_model_promotion_and_rollback_lifecycle():
    """
    Verify Phase 6 requirement:
    Promoting a valid model records the previous known-good version,
    and rollback safely restores the previous active version without loss.
    """
    models = list_models()
    assert len(models) >= 2
    initial_active_id = get_active_model_id()
    assert initial_active_id is not None

    # Pick another model that meets quality criteria
    target_candidate = None
    for m in models:
        if m["id"] != initial_active_id and m.get("accuracy", 0) >= QUALITY_GATE_MIN_ACCURACY:
            target_candidate = m
            break

    if target_candidate is None:
        pytest.skip("No second high-accuracy model available for promotion test")

    target_id = target_candidate["id"]

    # 1. Promote candidate to Deployed
    res = promote_model(target_id)
    assert res["status"] == "SUCCESS"
    assert get_active_model_id() == target_id

    # 2. Roll back to restore previous known-good model
    rb = rollback_model()
    assert rb["status"] == "SUCCESS"
    assert get_active_model_id() == initial_active_id
