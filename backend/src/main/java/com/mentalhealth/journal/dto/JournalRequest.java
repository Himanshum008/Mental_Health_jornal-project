package com.mentalhealth.journal.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class JournalRequest {

    @NotBlank(message = "Title cannot be blank")
    private String title;

    @NotBlank(message = "Journal content cannot be blank")
    private String content;

    private String userSelectedMood;

    private String tags;

    private LocalDate entryDate;

    public JournalRequest() {
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
}
