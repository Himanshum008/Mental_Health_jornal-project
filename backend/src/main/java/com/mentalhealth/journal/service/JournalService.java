package com.mentalhealth.journal.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mentalhealth.journal.dto.*;
import com.mentalhealth.journal.entity.JournalEntry;
import com.mentalhealth.journal.entity.MoodAnalysis;
import com.mentalhealth.journal.entity.User;
import com.mentalhealth.journal.exception.ResourceNotFoundException;
import com.mentalhealth.journal.repository.JournalEntryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;

@Service
public class JournalService {

    private final JournalEntryRepository journalRepository;
    private final MLClientService mlClientService;
    private final ObjectMapper objectMapper;

    public JournalService(
            JournalEntryRepository journalRepository,
            MLClientService mlClientService,
            ObjectMapper objectMapper
    ) {
        this.journalRepository = journalRepository;
        this.mlClientService = mlClientService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public JournalResponse createEntry(User user, JournalRequest request) {
        JournalEntry entry = new JournalEntry();
        entry.setUser(user);
        String rawTitle = (request.getTitle() != null && !request.getTitle().trim().isEmpty())
                ? request.getTitle().trim()
                : "Daily Reflection";
        entry.setTitle(rawTitle);
        entry.setContent(request.getContent());
        entry.setUserSelectedMood(request.getUserSelectedMood() != null ? request.getUserSelectedMood() : "Neutral");
        entry.setTags(request.getTags());
        entry.setEntryDate(request.getEntryDate() != null ? request.getEntryDate() : LocalDate.now());

        // Call ML prediction microservice
        MLPredictionResponse mlPrediction = mlClientService.predictMood(request.getContent());

        MoodAnalysis analysis = new MoodAnalysis();
        analysis.setPredictedMood(mlPrediction.getPredictedMood());
        analysis.setSentiment(mlPrediction.getSentiment());
        analysis.setConfidenceScore(mlPrediction.getConfidence());
        analysis.setModelVersionUsed(mlPrediction.getModelVersion());
        analysis.setAiReflectionInsight(mlPrediction.getReflectionInsight());

        try {
            if (mlPrediction.getEmotionScores() != null) {
                analysis.setEmotionScoresJson(objectMapper.writeValueAsString(mlPrediction.getEmotionScores()));
            }
        } catch (Exception e) {
            analysis.setEmotionScoresJson("{}");
        }

        entry.setMoodAnalysis(analysis);
        JournalEntry saved = journalRepository.save(entry);
        return mapToResponse(saved);
    }

    public Page<JournalResponse> getUserJournals(User user, int page, int size, String query, String mood) {
        Pageable pageable = PageRequest.of(page, size);
        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String m = (mood != null && !mood.trim().isEmpty() && !mood.equalsIgnoreCase("ALL")) ? mood.trim() : null;

        Page<JournalEntry> entries = journalRepository.searchUserJournals(user.getId(), q, m, pageable);
        return entries.map(this::mapToResponse);
    }

    public JournalResponse getJournalById(Long id, User user) {
        JournalEntry entry = journalRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Journal entry not found with id: " + id));
        return mapToResponse(entry);
    }

    @Transactional
    public JournalResponse updateJournal(Long id, User user, JournalRequest request) {
        JournalEntry entry = journalRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Journal entry not found with id: " + id));

        entry.setTitle(request.getTitle());
        entry.setContent(request.getContent());
        if (request.getUserSelectedMood() != null) {
            entry.setUserSelectedMood(request.getUserSelectedMood());
        }
        if (request.getTags() != null) {
            entry.setTags(request.getTags());
        }
        if (request.getEntryDate() != null) {
            entry.setEntryDate(request.getEntryDate());
        }

        // Re-analyze updated journal content
        MLPredictionResponse mlPrediction = mlClientService.predictMood(request.getContent());
        MoodAnalysis analysis = entry.getMoodAnalysis();
        if (analysis == null) {
            analysis = new MoodAnalysis();
            entry.setMoodAnalysis(analysis);
        }

        analysis.setPredictedMood(mlPrediction.getPredictedMood());
        analysis.setSentiment(mlPrediction.getSentiment());
        analysis.setConfidenceScore(mlPrediction.getConfidence());
        analysis.setModelVersionUsed(mlPrediction.getModelVersion());
        analysis.setAiReflectionInsight(mlPrediction.getReflectionInsight());

        try {
            if (mlPrediction.getEmotionScores() != null) {
                analysis.setEmotionScoresJson(objectMapper.writeValueAsString(mlPrediction.getEmotionScores()));
            }
        } catch (Exception e) {
            analysis.setEmotionScoresJson("{}");
        }

        JournalEntry saved = journalRepository.save(entry);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteJournal(Long id, User user) {
        JournalEntry entry = journalRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Journal entry not found with id: " + id));
        journalRepository.delete(entry);
    }

    public JournalResponse mapToResponse(JournalEntry entry) {
        JournalResponse resp = new JournalResponse();
        resp.setId(entry.getId());
        resp.setTitle(entry.getTitle());
        resp.setContent(entry.getContent());
        resp.setUserSelectedMood(entry.getUserSelectedMood());
        resp.setTags(entry.getTags());
        resp.setEntryDate(entry.getEntryDate());
        resp.setCreatedAt(entry.getCreatedAt());
        resp.setUpdatedAt(entry.getUpdatedAt());

        if (entry.getMoodAnalysis() != null) {
            MoodAnalysis analysis = entry.getMoodAnalysis();
            MoodAnalysisResponse maResp = new MoodAnalysisResponse();
            maResp.setId(analysis.getId());
            maResp.setPredictedMood(analysis.getPredictedMood());
            maResp.setSentiment(analysis.getSentiment());
            maResp.setConfidenceScore(analysis.getConfidenceScore());
            maResp.setEmotionScoresJson(analysis.getEmotionScoresJson());
            maResp.setModelVersionUsed(analysis.getModelVersionUsed());
            maResp.setAiReflectionInsight(analysis.getAiReflectionInsight());
            maResp.setAnalyzedAt(analysis.getAnalyzedAt());

            if (analysis.getEmotionScoresJson() != null) {
                try {
                    Map<String, Object> map = objectMapper.readValue(
                            analysis.getEmotionScoresJson(), new TypeReference<Map<String, Object>>() {}
                    );
                    maResp.setEmotionScores(map);
                } catch (Exception ignored) {
                }
            }
            resp.setMoodAnalysis(maResp);
        }

        return resp;
    }
}
