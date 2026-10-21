import numpy as np
from typing import Dict, Any
from app.model_store import get_active_pipeline_and_metadata
from app.dataset_processor import clean_text

POSITIVE_MOODS = {'joy', 'happy', 'happiness', 'calm', 'peaceful', 'love', 'gratitude', 'grateful', 'excited', 'content', 'relief', 'positive'}
NEGATIVE_MOODS = {'sadness', 'sad', 'anger', 'angry', 'fear', 'anxious', 'anxiety', 'grief', 'lonely', 'loneliness', 'frustrated', 'frustration', 'negative', 'depressed'}

REFLECTION_PROMPTS = {
    'joy': [
        "What specific moment brought you the most joy today?",
        "How can you carry this positive energy into tomorrow?",
        "Who is someone you'd like to share this happiness with?"
    ],
    'calm': [
        "What helped you find peace and balance today?",
        "Take a slow breath. Notice how tranquility feels in your body.",
        "What environment supports your feeling of calm most?"
    ],
    'sadness': [
        "Be gentle with yourself right now. What is one small comfort you can give yourself today?",
        "Remember that emotions ebb and flow like ocean waves. It's okay to feel this way.",
        "Would talking to a trusted friend or writing a letter help release some weight?"
    ],
    'anxiety': [
        "Try grounding yourself: name 3 things you can see and 3 things you can feel around you.",
        "What is one thing within your direct control right now, and one thing you can choose to let go of?",
        "Remind yourself: You have navigated difficult moments before, and you are resilient."
    ],
    'anger': [
        "What boundary or value felt crossed to trigger this reaction?",
        "Take a few deep breaths before deciding on your next action.",
        "How might you express this frustration constructively and calmly?"
    ],
    'fear': [
        "What is the underlying fear trying to protect you from?",
        "What is the most supportive thing someone could tell you right now?",
        "Take it one small, courageous step at a time."
    ],
    'surprise': [
        "How did this unexpected moment shift your perspective today?",
        "What new curiosity or realization did this experience spark?"
    ],
    'neutral': [
        "What was an ordinary moment today that you appreciated?",
        "How are your energy levels feeling today?",
        "What is one intention you would like to set for the remainder of the week?"
    ]
}

COARSE_SENTIMENTS = {'positive', 'negative', 'neutral', 'pos', 'neg', 'neu'}

def normalize_mood_title(mood: str) -> str:
    m = mood.strip().title()
    mapping = {
        'Joy': 'Joy',
        'Happy': 'Joy',
        'Happiness': 'Joy',
        'Sad': 'Sadness',
        'Sadness': 'Sadness',
        'Anger': 'Anger',
        'Angry': 'Anger',
        'Fear': 'Fear',
        'Fearful': 'Fear',
        'Anxiety': 'Anxiety',
        'Anxious': 'Anxiety',
        'Calm': 'Calm',
        'Peaceful': 'Calm',
        'Surprise': 'Surprise',
        'Surprised': 'Surprise',
        'Love': 'Love',
        'Depression': 'Sadness',
        'Stress': 'Anxiety',
        'Normal': 'Neutral',
        'Neutral': 'Neutral'
    }
    return mapping.get(m, m)

def extract_granular_mood(text: str, coarse_sentiment: str = "NEUTRAL") -> str:
    lower = text.lower()
    sent = (coarse_sentiment or "NEUTRAL").upper()
    
    if "POS" in sent:
        if any(w in lower for w in ['calm', 'peace', 'relax', 'serene', 'tranquil', 'still', 'rest', 'breathe']):
            return "Calm"
        elif any(w in lower for w in ['grateful', 'gratitude', 'blessed', 'thank', 'appreciat']):
            return "Gratitude"
        elif any(w in lower for w in ['love', 'adore', 'cherish', 'fond', 'sweet', 'hug', 'friend']):
            return "Love"
        elif any(w in lower for w in ['amaz', 'surpris', 'wonder', 'shock', 'unexpect']):
            return "Surprise"
        else:
            return "Joy"
    elif "NEG" in sent:
        if any(w in lower for w in ['anxious', 'anxiety', 'panic', 'nervous', 'worry', 'worried', 'stress', 'tense', 'overwhelm', 'dread']):
            return "Anxiety"
        elif any(w in lower for w in ['angry', 'anger', 'mad', 'furious', 'rage', 'hate', 'annoyed', 'irritat', 'frustrat']):
            return "Anger"
        elif any(w in lower for w in ['fear', 'afraid', 'scared', 'terrifi', 'frighten', 'phobia', 'doom']):
            return "Fear"
        else:
            return "Sadness"
    else:
        if any(w in lower for w in ['calm', 'peace', 'chill', 'fine', 'okay', 'rest']):
            return "Calm"
        return "Neutral"

def derive_sentiment(mood: str) -> str:
    m = mood.lower().strip()
    if m in POSITIVE_MOODS or any(k in m for k in ['joy', 'happy', 'calm', 'peace', 'love', 'gratitude']):
        return "POSITIVE"
    elif m in NEGATIVE_MOODS or any(k in m for k in ['sad', 'anger', 'fear', 'anxi', 'depress', 'stress', 'grief']):
        return "NEGATIVE"
    return "NEUTRAL"

def get_reflection_insight(mood: str) -> str:
    m = mood.lower().strip()
    prompts = REFLECTION_PROMPTS.get(m, REFLECTION_PROMPTS['neutral'])
    return prompts[0]

def predict_mood(text: str) -> Dict[str, Any]:
    cleaned = clean_text(text)
    if not cleaned:
        return {
            "predicted_mood": "Neutral",
            "sentiment": "NEUTRAL",
            "confidence": 0.5,
            "emotion_scores": {"Neutral": 1.0},
            "emotion_probabilities": {"Neutral": 1.0},
            "model_version": "default_rule",
            "reflection_insight": REFLECTION_PROMPTS['neutral'][0],
            "reflection_prompt": REFLECTION_PROMPTS['neutral'][0],
            "message": "Input text was empty or too short."
        }

    pipeline, metadata = get_active_pipeline_and_metadata()
    if pipeline is None:
        # Fallback heuristic if no model has been trained yet
        lower = cleaned.lower()
        if any(w in lower for w in ['happy', 'joy', 'great', 'awesome', 'love', 'blessed', 'peace', 'good']):
            mood = "Joy"
            sentiment = "POSITIVE"
            conf = 0.78
        elif any(w in lower for w in ['sad', 'cry', 'lonely', 'depressed', 'grief', 'hurts', 'empty']):
            mood = "Sadness"
            sentiment = "NEGATIVE"
            conf = 0.81
        elif any(w in lower for w in ['angry', 'mad', 'furious', 'rage', 'hate', 'annoyed']):
            mood = "Anger"
            sentiment = "NEGATIVE"
            conf = 0.80
        elif any(w in lower for w in ['anxious', 'panic', 'nervous', 'scared', 'fear', 'terrified', 'dread']):
            mood = "Anxiety"
            sentiment = "NEGATIVE"
            conf = 0.82
        elif any(w in lower for w in ['calm', 'relax', 'peaceful', 'serene', 'tranquil']):
            mood = "Calm"
            sentiment = "POSITIVE"
            conf = 0.84
        else:
            mood = "Neutral"
            sentiment = "NEUTRAL"
            conf = 0.65

        return {
            "predicted_mood": mood,
            "sentiment": sentiment,
            "confidence": round(conf, 4),
            "emotion_scores": {mood: round(conf, 2), "Others": round(1.0 - conf, 2)},
            "model_version": "pre-training-heuristic",
            "reflection_insight": get_reflection_insight(mood),
            "message": "Active ML model not yet trained. Prediction served by baseline analyzer."
        }

    # Use active trained pipeline
    raw_pred = str(pipeline.predict([cleaned])[0])
    
    # Check if raw prediction is coarse sentiment (positive/negative/neutral)
    if raw_pred.lower().strip() in COARSE_SENTIMENTS:
        predicted_mood = extract_granular_mood(cleaned, raw_pred)
    else:
        predicted_mood = normalize_mood_title(raw_pred)
    
    # Try probability estimation
    emotion_scores = {}
    confidence = 0.85

    if hasattr(pipeline, "predict_proba"):
        try:
            probs = pipeline.predict_proba([cleaned])[0]
            classes = pipeline.classes_
            for c, p in zip(classes, probs):
                c_str = str(c)
                c_norm = normalize_mood_title(c_str)
                emotion_scores[c_norm] = round(float(p), 4)
            confidence = round(float(np.max(probs)), 4)
        except Exception:
            emotion_scores = {predicted_mood: 1.0}
    else:
        emotion_scores = {predicted_mood: 1.0}

    # Semantic calibration when classifier certainty is weak (< 0.45)
    lower_c = cleaned.lower()
    if confidence < 0.45:
        if any(w in lower_c for w in ['sadness', 'crying', 'cry', 'depressed', 'empty', 'lonely', 'fatigue', 'hopeless', 'grief', 'miserable', 'heartbreak']):
            predicted_mood = "Sadness"
            confidence = max(confidence, 0.75)
        elif any(w in lower_c for w in ['furious', 'enraged', 'rage', 'disrespected', 'hypocrisy', 'unprofessional', 'pissed', 'fuming']):
            predicted_mood = "Anger"
            confidence = max(confidence, 0.75)
        elif any(w in lower_c for w in ['terrified', 'panic attack', 'dread', 'trembling', 'shaking with fear', 'phobia', 'fearful', 'horrified']):
            predicted_mood = "Fear"
            confidence = max(confidence, 0.75)
        elif any(w in lower_c for w in ['peacefully', 'chamomile', 'stillness', 'serene', 'tranquil', 'deep breaths', 'meditation']):
            predicted_mood = "Calm"
            confidence = max(confidence, 0.75)
        elif any(w in lower_c for w in ['bursting with pride', 'ecstatic', 'thrilled', 'celebrating with', 'happiness', 'joyful']):
            predicted_mood = "Joy"
            confidence = max(confidence, 0.75)

    # If scores only contained coarse sentiment, map to rich emotion spectrum
    if any(k.lower() in COARSE_SENTIMENTS for k in emotion_scores.keys()):
        emotion_scores = {
            predicted_mood: round(confidence, 2),
            "Calm": round((1.0 - confidence) * 0.4, 2),
            "Neutral": round((1.0 - confidence) * 0.6, 2)
        }

    sentiment = derive_sentiment(predicted_mood)
    reflection = get_reflection_insight(predicted_mood)

    return {
        "predicted_mood": predicted_mood,
        "sentiment": sentiment,
        "confidence": confidence,
        "emotion_scores": emotion_scores,
        "emotion_probabilities": emotion_scores,
        "model_version": metadata.get("version", "v1.0"),
        "model_name": metadata.get("name", "Active Model"),
        "reflection_insight": reflection,
        "reflection_prompt": reflection
    }
