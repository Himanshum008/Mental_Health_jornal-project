package com.mentalhealth.journal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public class MLPredictionResponse {
    @JsonProperty("predicted_mood")
    private String predictedMood;

    @JsonProperty("sentiment")
    private String sentiment;

    @JsonProperty("confidence")
    private Double confidence;

    @JsonProperty("emotion_scores")
    private Map<String, Object> emotionScores;

    @JsonProperty("model_version")
    private String modelVersion;

    @JsonProperty("model_name")
    private String modelName;

    @JsonProperty("reflection_insight")
    private String reflectionInsight;

    public MLPredictionResponse() {
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

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public Map<String, Object> getEmotionScores() {
        return emotionScores;
    }

    public void setEmotionScores(Map<String, Object> emotionScores) {
        this.emotionScores = emotionScores;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getReflectionInsight() {
        return reflectionInsight;
    }

    public void setReflectionInsight(String reflectionInsight) {
        this.reflectionInsight = reflectionInsight;
    }
}
