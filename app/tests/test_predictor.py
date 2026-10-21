import pytest
from app.predictor import predict_mood

def test_predict_mood_positive_sample():
    sample_text = "I had the best day with my closest friends laughing and eating delicious food!"
    result = predict_mood(sample_text)

    # Validate output dictionary schema
    assert "predicted_mood" in result
    assert "sentiment" in result
    assert "confidence" in result
    assert "emotion_probabilities" in result
    assert "reflection_prompt" in result

    assert isinstance(result["predicted_mood"], str)
    assert result["sentiment"] in ["POSITIVE", "NEUTRAL", "NEGATIVE"]
    assert 0.0 <= result["confidence"] <= 1.0
    assert len(result["emotion_probabilities"]) > 0
    assert len(result["reflection_prompt"]) > 5

def test_predict_mood_anxious_sample():
    sample_text = "I am so anxious and terrified about failing my upcoming final examination."
    result = predict_mood(sample_text)

    assert "predicted_mood" in result
    assert result["sentiment"] in ["NEGATIVE", "NEUTRAL"]
    assert isinstance(result["reflection_prompt"], str)

def test_predict_mood_handles_short_or_empty_text():
    result = predict_mood("")
    assert "predicted_mood" in result
    assert "reflection_prompt" in result
