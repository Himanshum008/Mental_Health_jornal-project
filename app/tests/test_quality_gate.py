import os
import pytest
import pandas as pd
from app.model_store import get_active_model_id, load_active_model, get_model
from app.model_trainer import train_and_evaluate_model
from app.config import STORAGE_DIR

# Documented ML Quality Gate Thresholds
MIN_ACCURACY_THRESHOLD = 0.75
MIN_MACRO_F1_THRESHOLD = 0.70

def test_active_model_artifact_exists():
    """Verify that an active model artifact exists and is loadable."""
    active_id = get_active_model_id()
    assert active_id is not None, "Quality Gate Error: No active model pointer found in storage/active_model.json"

    pipeline, metadata = load_active_model()
    assert pipeline is not None, f"Quality Gate Error: Active model pipeline '{active_id}' failed to load"
    assert metadata is not None, f"Quality Gate Error: Active model metadata for '{active_id}' is missing"

def test_active_model_quality_gate_baseline():
    """
    ML Quality Gate Evaluation:
    Verifies that the deployed active model satisfies the documented Quality Gate
    thresholds on held-out evaluation data (Accuracy >= 0.75, F1 >= 0.70).
    """
    pipeline, metadata = load_active_model()
    assert metadata is not None

    accuracy = metadata.get("accuracy", 0.0)
    f1_score_val = metadata.get("f1_score", 0.0)

    print(f"\n[Active Model Quality Gate Evaluation]")
    print(f"Model ID       : {metadata.get('id')}")
    print(f"Algorithm      : {metadata.get('algorithm')}")
    print(f"Test Split Size: {metadata.get('test_samples')} samples")
    print(f"Held-out Acc   : {accuracy:.4f} (Threshold: {MIN_ACCURACY_THRESHOLD})")
    print(f"Held-out F1    : {f1_score_val:.4f} (Threshold: {MIN_MACRO_F1_THRESHOLD})")

    assert accuracy >= MIN_ACCURACY_THRESHOLD, (
        f"ML Quality Gate FAILED: Active model accuracy {accuracy:.4f} is below "
        f"minimum required threshold {MIN_ACCURACY_THRESHOLD}. Promotion blocked!"
    )

    assert f1_score_val >= MIN_MACRO_F1_THRESHOLD, (
        f"ML Quality Gate FAILED: Active model F1-score {f1_score_val:.4f} is below "
        f"minimum required threshold {MIN_MACRO_F1_THRESHOLD}. Promotion blocked!"
    )

def test_candidate_training_quality_gate():
    """
    Evaluates candidate model training and held-out quality gate execution.
    A candidate must meet quality standards on its holdout test set before being eligible for promotion.
    """
    dataset_path = STORAGE_DIR / "datasets" / "emotion_dataset.csv"
    if not dataset_path.exists():
        pytest.skip("Benchmark dataset emotion_dataset.csv not found")

    df = pd.read_csv(dataset_path)
    pipeline, metrics = train_and_evaluate_model(
        df=df,
        text_col="journal_text",
        label_col="mood",
        algorithm="LOGISTIC_REGRESSION",
        test_size=0.20,
        random_state=42
    )

    acc = metrics["accuracy"]
    f1 = metrics["f1_score"]

    print(f"\n[Candidate Model Quality Gate Check]")
    print(f"Candidate Acc  : {acc:.4f} (Quality Gate >= 0.65)")
    print(f"Candidate F1   : {f1:.4f} (Quality Gate >= 0.60)")

    assert acc >= 0.65, f"Candidate failed quality gate: accuracy {acc} < 0.65"
    assert f1 >= 0.60, f"Candidate failed quality gate: F1-score {f1} < 0.60"

def test_demonstrate_controlled_failure():
    """
    Controlled failure test for PS-4 Demonstration (Phase 3 & Phase 4).
    Run with environment variable DEMO_FAILING_TEST=true to trigger an intentional Quality Gate failure:
    e.g. In PowerShell: $env:DEMO_FAILING_TEST="true"; python -m pytest app/tests
    """
    if os.environ.get("DEMO_FAILING_TEST", "").lower() in ["true", "1", "yes"]:
        pipeline, metadata = load_active_model()
        strict_impossible_threshold = 0.9999
        measured_f1 = metadata.get("f1_score", 0.98)

        assert measured_f1 >= strict_impossible_threshold, (
            f"[CONTROLLED FAILURE DEMO] Quality Gate Blocked: Model F1 {measured_f1:.4f} "
            f"< required threshold {strict_impossible_threshold}. Promotion blocked intentionally!"
        )
