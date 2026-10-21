import pytest
import numpy as np
from app.model_trainer import train_and_evaluate_model

@pytest.mark.parametrize("algorithm", [
    "LOGISTIC_REGRESSION",
    "MULTINOMIAL_NB",
    "LINEAR_SVM"
])
def test_train_and_evaluate_all_algorithms(synthetic_journal_dataframe, algorithm):
    pipeline, metrics = train_and_evaluate_model(
        df=synthetic_journal_dataframe,
        text_col="journal_text",
        label_col="emotion",
        algorithm=algorithm,
        test_size=0.25,
        random_state=42
    )

    # 1. Pipeline verification
    assert pipeline is not None
    test_pred = pipeline.predict(["I had an awesome and delightful day today!"])
    assert len(test_pred) == 1
    assert isinstance(test_pred[0], str)

    # 2. Metrics structure verification
    assert "accuracy" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert "f1_score" in metrics
    assert "confusion_matrix" in metrics
    assert "class_distribution" in metrics
    assert "detailed_report" in metrics

    # Value ranges
    assert 0.0 <= metrics["accuracy"] <= 1.0
    assert 0.0 <= metrics["f1_score"] <= 1.0
    assert metrics["train_samples"] > 0
    assert metrics["test_samples"] > 0
    assert len(metrics["confusion_matrix"]["labels"]) == 4
