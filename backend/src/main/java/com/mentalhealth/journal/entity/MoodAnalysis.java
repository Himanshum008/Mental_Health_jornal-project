package com.mentalhealth.journal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mood_analyses")
public class MoodAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id", nullable = false, unique = true)
    private JournalEntry journalEntry;

    @Column(name = "predicted_mood", nullable = false, length = 60)
    private String predictedMood;

    @Column(nullable = false, length = 30)
    private String sentiment; // POSITIVE, NEUTRAL, NEGATIVE

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "emotion_scores_json", columnDefinition = "TEXT")
    private String emotionScoresJson;

    @Column(name = "model_version_used", length = 100)
    private String modelVersionUsed;

    @Column(name = "ai_reflection_insight", columnDefinition = "TEXT")
    private String aiReflectionInsight;

    @Column(name = "analyzed_at")
    private LocalDateTime analyzedAt;

    public MoodAnalysis() {
    }

    public MoodAnalysis(String predictedMood, String sentiment, Double confidenceScore, 
                        String emotionScoresJson, String modelVersionUsed, String aiReflectionInsight) {
        this.predictedMood = predictedMood;
        this.sentiment = sentiment;
        this.confidenceScore = confidenceScore;
        this.emotionScoresJson = emotionScoresJson;
        this.modelVersionUsed = modelVersionUsed;
        this.aiReflectionInsight = aiReflectionInsight;
        this.analyzedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.analyzedAt == null) {
            this.analyzedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public JournalEntry getJournalEntry() {
        return journalEntry;
    }

    public void setJournalEntry(JournalEntry journalEntry) {
        this.journalEntry = journalEntry;
    }

    public String getPredictedMood() {
        return predictedMood;
    }

    public void setPredictedMood(String predictedMood) {
        this.predictedMood = predictedMood;
    }

    public String getSentiment() {
        return sentiment;
    }

    public void setSentiment(String sentiment) {
        this.sentiment = sentiment;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getEmotionScoresJson() {
        return emotionScoresJson;
    }

    public void setEmotionScoresJson(String emotionScoresJson) {
        this.emotionScoresJson = emotionScoresJson;
    }

    public String getModelVersionUsed() {
        return modelVersionUsed;
    }

    public void setModelVersionUsed(String modelVersionUsed) {
        this.modelVersionUsed = modelVersionUsed;
    }

    public String getAiReflectionInsight() {
        return aiReflectionInsight;
    }

    public void setAiReflectionInsight(String aiReflectionInsight) {
        this.aiReflectionInsight = aiReflectionInsight;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }
}
