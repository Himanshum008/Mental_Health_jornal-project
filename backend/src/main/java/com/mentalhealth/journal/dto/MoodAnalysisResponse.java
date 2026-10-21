package com.mentalhealth.journal.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class MoodAnalysisResponse {
    private Long id;
    private String predictedMood;
    private String sentiment;
    private Double confidenceScore;
    private String emotionScoresJson;
    private Map<String, Object> emotionScores;
    private String modelVersionUsed;
    private String aiReflectionInsight;
    private LocalDateTime analyzedAt;

    public MoodAnalysisResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Map<String, Object> getEmotionScores() {
        return emotionScores;
    }

    public void setEmotionScores(Map<String, Object> emotionScores) {
        this.emotionScores = emotionScores;
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
