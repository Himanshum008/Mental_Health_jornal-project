package com.mentalhealth.journal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mentalhealth.journal.dto.JournalRequest;
import com.mentalhealth.journal.dto.JournalResponse;
import com.mentalhealth.journal.dto.MLPredictionResponse;
import com.mentalhealth.journal.entity.JournalEntry;
import com.mentalhealth.journal.entity.MoodAnalysis;
import com.mentalhealth.journal.entity.User;
import com.mentalhealth.journal.repository.JournalEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JournalServiceTest {

    @Mock
    private JournalEntryRepository journalRepository;

    @Mock
    private MLClientService mlClientService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private JournalService journalService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("alice", "alice@example.com", "pass", "Alice Smith", "ROLE_USER");
        testUser.setId(10L);
    }

    @Test
    void createEntry_WithMLInference_Success() {
        JournalRequest request = new JournalRequest();
        request.setTitle("Calm Morning");
        request.setContent("I drank herbal tea and did ten minutes of morning meditation.");
        request.setUserSelectedMood("Calm");
        request.setEntryDate(LocalDate.now());

        MLPredictionResponse mlMock = new MLPredictionResponse();
        mlMock.setPredictedMood("Calm");
        mlMock.setSentiment("POSITIVE");
        mlMock.setConfidence(0.92);
        mlMock.setModelVersion("v18.0");
        mlMock.setReflectionInsight("Notice how tranquility feels in your body.");
        mlMock.setEmotionScores(Map.of("Calm", 0.92, "Neutral", 0.08));

        when(mlClientService.predictMood(anyString())).thenReturn(mlMock);
        when(journalRepository.save(any(JournalEntry.class))).thenAnswer(invocation -> {
            JournalEntry saved = invocation.getArgument(0);
            saved.setId(101L);
            return saved;
        });

        JournalResponse response = journalService.createEntry(testUser, request);

        assertNotNull(response);
        assertEquals("Calm Morning", response.getTitle());
        assertEquals("Calm", response.getUserSelectedMood());
        assertNotNull(response.getMoodAnalysis());
        assertEquals("Calm", response.getMoodAnalysis().getPredictedMood());
        assertEquals("POSITIVE", response.getMoodAnalysis().getSentiment());
        assertEquals(0.92, response.getMoodAnalysis().getConfidenceScore());
        verify(journalRepository, times(1)).save(any(JournalEntry.class));
    }
}
