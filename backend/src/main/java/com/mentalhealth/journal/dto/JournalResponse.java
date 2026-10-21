package com.mentalhealth.journal.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class JournalResponse {
    private Long id;
    private String title;
    private String content;
    private String userSelectedMood;
    private String tags;
    private LocalDate entryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private MoodAnalysisResponse moodAnalysis;

    public JournalResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getUserSelectedMood() {
        return userSelectedMood;
    }

    public void setUserSelectedMood(String userSelectedMood) {
        this.userSelectedMood = userSelectedMood;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public MoodAnalysisResponse getMoodAnalysis() {
        return moodAnalysis;
    }

    public void setMoodAnalysis(MoodAnalysisResponse moodAnalysis) {
        this.moodAnalysis = moodAnalysis;
    }
}
