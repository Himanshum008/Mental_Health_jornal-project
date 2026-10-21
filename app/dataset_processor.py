import re
import pandas as pd
from typing import Dict, Any, List
from pathlib import Path

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'[\r\n\t]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def inspect_csv(file_path: Path) -> Dict[str, Any]:
    try:
        # Detect encoding and separator safely
        df = pd.read_csv(file_path, nrows=50000)
    except UnicodeDecodeError:
        df = pd.read_csv(file_path, encoding='latin1', nrows=50000)

    total_rows = len(df)
    columns = list(df.columns)
    missing_per_col = df.isnull().sum().to_dict()
    duplicate_rows = int(df.duplicated().sum())

    preview_rows = df.head(5).to_dict(orient="records")

    # Suggest text and label columns with strict prioritization
    suggested_text_col = None
    suggested_label_col = None

    text_priority = ['journal_text', 'journal', 'entry', 'content', 'statement', 'text', 'sentence']
    label_priority = ['mood', 'emotion', 'primary_emotion', 'feeling', 'mental_state', 'status', 'sentiment', 'category', 'label', 'class', 'target']

    # Search for highest priority match for text
    for term in text_priority:
        for col in columns:
            if term == col.lower() or term in col.lower():
                suggested_text_col = col
                break
        if suggested_text_col:
            break

    # Search for highest priority match for label
    for term in label_priority:
        for col in columns:
            if col != suggested_text_col and (term == col.lower() or term in col.lower()):
                suggested_label_col = col
                break
        if suggested_label_col:
            break

    # Fallbacks if not auto-detected
    if not suggested_text_col and len(columns) >= 1:
        text_candidates = [c for c in columns if df[c].dtype == object]
        if text_candidates:
            suggested_text_col = max(text_candidates, key=lambda c: df[c].astype(str).str.len().mean())
        else:
            suggested_text_col = columns[0]

    if not suggested_label_col and len(columns) >= 2:
        other_cols = [c for c in columns if c != suggested_text_col]
        suggested_label_col = other_cols[0]

    return {
        "total_rows": total_rows,
        "total_columns": len(columns),
        "columns": columns,
        "missing_values": missing_per_col,
        "duplicate_rows": duplicate_rows,
        "preview": preview_rows,
        "suggested_text_column": suggested_text_col,
        "suggested_label_column": suggested_label_col
    }

def validate_and_preprocess_dataset(file_path: Path, text_col: str, label_col: str) -> Dict[str, Any]:
    try:
        df = pd.read_csv(file_path)
    except UnicodeDecodeError:
        df = pd.read_csv(file_path, encoding='latin1')

    if text_col not in df.columns:
        raise ValueError(f"Text column '{text_col}' not found in dataset. Available columns: {list(df.columns)}")
    if label_col not in df.columns:
        raise ValueError(f"Label column '{label_col}' not found in dataset. Available columns: {list(df.columns)}")

    initial_count = len(df)

    # Filter out missing text or label
    df = df.dropna(subset=[text_col, label_col])
    df[text_col] = df[text_col].astype(str).apply(clean_text)
    df[label_col] = df[label_col].astype(str).str.strip()

    # Drop entries where text became empty
    df = df[df[text_col].str.len() > 2]
    df = df[df[label_col].str.len() > 0]

    final_count = len(df)
    class_counts = df[label_col].value_counts().to_dict()

    if len(class_counts) < 2:
        raise ValueError(f"Dataset must have at least 2 distinct classes to train a model. Found: {list(class_counts.keys())}")

    return {
        "initial_rows": initial_count,
        "cleaned_rows": final_count,
        "dropped_rows": initial_count - final_count,
        "unique_classes": len(class_counts),
        "class_distribution": class_counts,
        "preview_cleaned": df[[text_col, label_col]].head(5).to_dict(orient="records"),
        "df": df
    }
