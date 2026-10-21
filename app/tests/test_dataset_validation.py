import pytest
import pandas as pd
from app.dataset_processor import clean_text, inspect_csv, validate_and_preprocess_dataset

def test_clean_text_removes_urls_and_whitespace():
    raw_text = "  Check this link https://example.com/relax  and    breathe deeply! \n\t "
    cleaned = clean_text(raw_text)
    assert "https://" not in cleaned
    assert "example.com" not in cleaned
    assert "  " not in cleaned
    assert cleaned == "check this link and breathe deeply!"

def test_clean_text_handles_non_strings():
    assert clean_text(None) == ""
    assert clean_text(12345) == ""

def test_inspect_csv_schema_detection(temp_dataset_csv):
    info = inspect_csv(temp_dataset_csv)
    assert info["total_rows"] == 24
    assert info["total_columns"] == 2
    assert "journal_text" in info["columns"]
    assert "emotion" in info["columns"]
    assert info["suggested_text_column"] == "journal_text"
    assert info["suggested_label_column"] == "emotion"
    assert info["duplicate_rows"] == 0

def test_validate_and_preprocess_dataset_success(temp_dataset_csv):
    result = validate_and_preprocess_dataset(
        temp_dataset_csv,
        text_col="journal_text",
        label_col="emotion"
    )
    assert result["initial_rows"] == 24
    assert result["cleaned_rows"] == 24
    assert result["unique_classes"] == 4
    assert set(result["class_distribution"].keys()) == {"Joy", "Sadness", "Anxiety", "Calm"}
    assert isinstance(result["df"], pd.DataFrame)

def test_validate_dataset_missing_column_error(temp_dataset_csv):
    with pytest.raises(ValueError, match="Text column 'non_existent_col' not found"):
        validate_and_preprocess_dataset(
            temp_dataset_csv,
            text_col="non_existent_col",
            label_col="emotion"
        )
