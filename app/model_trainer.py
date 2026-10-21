import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report

def train_and_evaluate_model(
    df: pd.DataFrame,
    text_col: str,
    label_col: str,
    algorithm: str = "LOGISTIC_REGRESSION",
    test_size: float = 0.2,
    random_state: int = 42
) -> Tuple[Pipeline, Dict[str, Any]]:
    X = df[text_col].values
    y = df[label_col].values

    # Stratified split if minimum class count allows
    min_class_count = df[label_col].value_counts().min()
    stratify = y if min_class_count >= 2 else None

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=stratify
    )

    # 1. Feature Extraction: TF-IDF (preserves sentiment negations like 'not', 'never', 'no')
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=15000,
        sublinear_tf=True,
        min_df=1
    )

    # 2. Classifier Selection with Balanced Class Weighting
    algo_key = algorithm.upper()
    if "NAIVE" in algo_key:
        classifier = MultinomialNB(alpha=0.2)
        algo_name = "Multinomial Naive Bayes"
    elif "SVM" in algo_key:
        base_svc = LinearSVC(
            dual='auto' if hasattr(LinearSVC(), 'dual') else False,
            random_state=random_state,
            max_iter=3000,
            class_weight='balanced',
            C=1.2
        )
        classifier = CalibratedClassifierCV(estimator=base_svc)
        algo_name = "Support Vector Machine (Linear SVM)"
    else:
        classifier = LogisticRegression(
            max_iter=1500,
            random_state=random_state,
            C=2.5,
            class_weight='balanced'
        )
        algo_name = "Logistic Regression"

    pipeline = Pipeline([
        ('tfidf', vectorizer),
        ('clf', classifier)
    ])

    # Fit pipeline
    pipeline.fit(X_train, y_train)

    # Predictions on test set
    y_pred = pipeline.predict(X_test)

    # Evaluation Metrics
    accuracy = float(accuracy_score(y_test, y_pred))
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted', zero_division=0)
    
    unique_labels = sorted(list(set(y)))
    cm = confusion_matrix(y_test, y_pred, labels=unique_labels)
    report_dict = classification_report(y_test, y_pred, labels=unique_labels, output_dict=True, zero_division=0)

    # Format confusion matrix for UI
    cm_formatted = {
        "labels": unique_labels,
        "matrix": cm.tolist()
    }

    class_distribution = {str(k): int(v) for k, v in pd.Series(y).value_counts().items()}

    metrics = {
        "algorithm": algo_name,
        "algorithm_key": algo_key,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "accuracy": round(accuracy, 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1_score": round(float(f1), 4),
        "confusion_matrix": cm_formatted,
        "class_distribution": class_distribution,
        "classes": unique_labels,
        "detailed_report": report_dict
    }

    return pipeline, metrics
