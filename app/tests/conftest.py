import os
import sys
import pytest
import pandas as pd
from pathlib import Path

# Ensure root directory is on python path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

@pytest.fixture
def synthetic_journal_dataframe():
    """
    Synthetic dataset for ML unit testing.
    Uses generic, non-personal mood statements across balanced classes.
    """
    data = [
        # Joy / Positive
        {"journal_text": "I had a wonderful day walking in the sunny park and feeling relaxed.", "emotion": "Joy"},
        {"journal_text": "Received great news about my project at school and celebrated with friends.", "emotion": "Joy"},
        {"journal_text": "Feeling very proud, energetic, and happy with the progress today.", "emotion": "Joy"},
        {"journal_text": "Laughed so much today with my family during dinner.", "emotion": "Joy"},
        {"journal_text": "Excited for the upcoming weekend and feeling grateful for life.", "emotion": "Joy"},
        {"journal_text": "The morning sun brought so much joy and peace into my heart.", "emotion": "Joy"},

        # Sadness / Negative
        {"journal_text": "Feeling quite down and lonely this evening, missing old memories.", "emotion": "Sadness"},
        {"journal_text": "Today was heavy and exhausting, finding it hard to stay motivated.", "emotion": "Sadness"},
        {"journal_text": "Crying alone in my room because things did not go well.", "emotion": "Sadness"},
        {"journal_text": "Everything feels grey and dull right now, struggling with grief.", "emotion": "Sadness"},
        {"journal_text": "Disappointed by the result after working so hard.", "emotion": "Sadness"},
        {"journal_text": "Feeling hopeless and overwhelmed with melancholy.", "emotion": "Sadness"},

        # Anxiety / Fear
        {"journal_text": "I feel worried and my heart is racing about tomorrow's presentation.", "emotion": "Anxiety"},
        {"journal_text": "Overthinking everything and fearing what might go wrong next.", "emotion": "Anxiety"},
        {"journal_text": "So much panic and stress regarding upcoming deadlines.", "emotion": "Anxiety"},
        {"journal_text": "My palms are sweating and I can not stop stressing about the interview.", "emotion": "Anxiety"},
        {"journal_text": "Constantly feeling tense, restless, and uneasy about the future.", "emotion": "Anxiety"},
        {"journal_text": "Scared that I am not prepared enough for the exam tomorrow.", "emotion": "Anxiety"},

        # Calm / Neutral
        {"journal_text": "Spent a quiet afternoon reading a book and sipping green tea.", "emotion": "Calm"},
        {"journal_text": "A balanced and peaceful routine today, nothing unusual happened.", "emotion": "Calm"},
        {"journal_text": "Meditated for twenty minutes and feeling composed and centered.", "emotion": "Calm"},
        {"journal_text": "Completed regular daily chores, resting on the couch now.", "emotion": "Calm"},
        {"journal_text": "Taking deep breaths, enjoying the quiet stillness of the evening.", "emotion": "Calm"},
        {"journal_text": "A standard productive day without any stress or dramatic events.", "emotion": "Calm"},
    ]
    return pd.DataFrame(data)

@pytest.fixture
def temp_dataset_csv(tmp_path, synthetic_journal_dataframe):
    csv_file = tmp_path / "synthetic_test_journal.csv"
    synthetic_journal_dataframe.to_csv(csv_file, index=False)
    return csv_file
