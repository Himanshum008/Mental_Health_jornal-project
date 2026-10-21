package com.mentalhealth.journal.dto;

import java.util.Map;

public class AnalyticsSummaryDTO {
    private long totalEntries;
    private int currentStreakDays;
    private String dominantMood;
    private double averageConfidence;
    private long positiveCount;
    private long neutralCount;
    private long negativeCount;
    private Map<String, Long> moodDistribution;

    public AnalyticsSummaryDTO() {
    }

    public long getTotalEntries() {
        return totalEntries;
    }

    public void setTotalEntries(long totalEntries) {
        this.totalEntries = totalEntries;
    }

    public int getCurrentStreakDays() {
        return currentStreakDays;
    }

    public void setCurrentStreakDays(int currentStreakDays) {
        this.currentStreakDays = currentStreakDays;
    }

    public String getDominantMood() {
        return dominantMood;
    }

    public void setDominantMood(String dominantMood) {
        this.dominantMood = dominantMood;
    }

    public double getAverageConfidence() {
        return averageConfidence;
    }

    public void setAverageConfidence(double averageConfidence) {
        this.averageConfidence = averageConfidence;
    }

    public long getPositiveCount() {
        return positiveCount;
    }

    public void setPositiveCount(long positiveCount) {
        this.positiveCount = positiveCount;
    }

    public long getNeutralCount() {
        return neutralCount;
    }

    public void setNeutralCount(long neutralCount) {
        this.neutralCount = neutralCount;
    }

    public long getNegativeCount() {
        return negativeCount;
    }

    public void setNegativeCount(long negativeCount) {
        this.negativeCount = negativeCount;
    }

    public Map<String, Long> getMoodDistribution() {
        return moodDistribution;
    }

    public void setMoodDistribution(Map<String, Long> moodDistribution) {
        this.moodDistribution = moodDistribution;
    }
}
