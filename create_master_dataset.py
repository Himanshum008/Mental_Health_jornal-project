import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Load component datasets
df_kaggle = pd.read_csv(BASE_DIR / 'datasets' / 'kaggle_emotions_benchmark.csv')
df_kaggle.rename(columns={'text': 'journal_text', 'emotion': 'mood'}, inplace=True)
df_kaggle['mood'] = df_kaggle['mood'].str.strip().str.title()

df_daily = pd.read_csv(BASE_DIR / 'datasets' / 'daily_reflection_moods.csv')
df_daily.rename(columns={'journal_content': 'journal_text', 'primary_emotion': 'mood'}, inplace=True)
df_daily['mood'] = df_daily['mood'].replace({'Gratitude': 'Love'})

df_mh = pd.read_csv(BASE_DIR / 'datasets' / 'mental_health_journal_statements.csv')
df_mh.rename(columns={'statement': 'journal_text', 'mental_state': 'mood'}, inplace=True)
df_mh['mood'] = df_mh['mood'].replace({
    'Healthy & Balanced': 'Calm',
    'Stress': 'Anxiety',
    'Anxiety': 'Anxiety',
    'Depression': 'Sadness'
})

df_emo = pd.read_csv(BASE_DIR / 'datasets' / 'emotion_dataset.csv')[['journal_text', 'mood']]
df_emo['mood'] = df_emo['mood'].str.strip().str.title()

# Rich Neutral / Ordinary daily reflections
neutral_phrases = [
    "Today was an ordinary routine day with groceries and laundry.",
    "Woke up at 7am, made my breakfast and walked to the bus station.",
    "Organized my desk and sorted through old study notes.",
    "Attended regular team meeting and submitted the weekly report.",
    "Cooked rice and vegetables for dinner while listening to news.",
    "Purchased household groceries and paid monthly electricity bill.",
    "Spent the evening tidying up the kitchen and folding clothes.",
    "A standard quiet day without anything unusual happening.",
    "Checked off items from my to-do list one by one.",
    "Took the subway to work and returned home at 6pm as usual.",
    "Replied to emails and updated the shared project spreadsheet.",
    "Cleaned the living room and replaced the air filter.",
    "Went for my usual 20-minute evening walk around the block.",
    "Made coffee, reviewed notes, and prepped for tomorrow.",
    "A balanced, average day going about my regular schedule.",
    "Washed dishes, watered the plants, and read the local news.",
    "Just a typical Tuesday with no surprises or big events.",
    "Bought groceries, cooked a simple dinner, and did some chores."
]
neutral_records = []
for p in neutral_phrases:
    neutral_records.append({"journal_text": p, "mood": "Neutral"})
    neutral_records.append({"journal_text": f"Today: {p}", "mood": "Neutral"})
    neutral_records.append({"journal_text": f"Journal entry: {p}", "mood": "Neutral"})
    neutral_records.append({"journal_text": f"Writing down my day: {p}", "mood": "Neutral"})
    neutral_records.append({"journal_text": f"Reflecting on today: {p}", "mood": "Neutral"})
    neutral_records.append({"journal_text": f"Simple daily log: {p}", "mood": "Neutral"})
    neutral_records.append({"journal_text": f"Daily update: {p}", "mood": "Neutral"})
    neutral_records.append({"journal_text": f"Routine check-in: {p}", "mood": "Neutral"})
    neutral_records.append({"journal_text": f"Ordinary hours: {p}", "mood": "Neutral"})
    neutral_records.append({"journal_text": f"Standard routine: {p}", "mood": "Neutral"})

df_neutral = pd.DataFrame(neutral_records)

# Rich Calm phrases augmentation to make calm crystal clear
calm_phrases = [
    "I had a calm, peaceful evening reading my book and enjoying silence.",
    "Drinking hot chamomile tea by the window while it rains gently outside.",
    "Taking slow, deep breaths and feeling deeply grounded and serene.",
    "Finding complete stillness in meditation after a long week.",
    "Sitting peacefully in nature, watching the sunset with a quiet mind.",
    "Letting go of tension, feeling tranquil, rested, and at ease.",
    "The house is quiet, and my heart feels completely at peace.",
    "Resting peacefully on the couch, listening to soothing ambient music.",
    "A serene and unhurried morning sipping coffee with zero rush.",
    "Feeling centered, balanced, and gently relaxed today."
]
calm_records = []
for p in calm_phrases:
    calm_records.append({"journal_text": p, "mood": "Calm"})
    calm_records.append({"journal_text": f"Reflection: {p}", "mood": "Calm"})
    calm_records.append({"journal_text": f"At this moment: {p}", "mood": "Calm"})
    calm_records.append({"journal_text": f"Tonight: {p}", "mood": "Calm"})
    calm_records.append({"journal_text": f"Journal entry: {p}", "mood": "Calm"})
    calm_records.append({"journal_text": f"Deep breath: {p}", "mood": "Calm"})

df_calm_extra = pd.DataFrame(calm_records)

# Combine everything
master = pd.concat([df_kaggle, df_daily, df_mh, df_emo, df_neutral, df_calm_extra], ignore_index=True)
master.dropna(subset=['journal_text', 'mood'], inplace=True)
master.drop_duplicates(subset=['journal_text'], inplace=True)

valid_moods = {'Joy', 'Sadness', 'Calm', 'Anger', 'Anxiety', 'Fear', 'Love', 'Surprise', 'Neutral'}
master = master[master['mood'].isin(valid_moods)]

# Write files
target_files = [
    BASE_DIR / 'datasets' / 'serene_mind_master_emotions.csv',
    BASE_DIR / 'storage' / 'datasets' / 'serene_mind_master_emotions.csv',
    Path('C:/Users/Himanshu/OneDrive/Desktop/serene_mind_master_emotions.csv')
]

for p in target_files:
    try:
        p.parent.mkdir(parents=True, exist_ok=True)
        master.to_csv(p, index=False)
        print(f"Saved: {p}")
    except Exception as e:
        print(f"Could not save {p}: {e}")

print("\nFinal Master Dataset Summary:")
print("Total rows:", len(master))
print(master['mood'].value_counts())
