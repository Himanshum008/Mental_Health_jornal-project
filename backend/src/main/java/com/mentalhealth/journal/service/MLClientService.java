package com.mentalhealth.journal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mentalhealth.journal.dto.MLPredictionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class MLClientService {

    private static final Logger log = LoggerFactory.getLogger(MLClientService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String mlServiceUrl;

    public MLClientService(
            @Value("${ml.service.url:http://localhost:8000}") String mlServiceUrl,
            ObjectMapper objectMapper
    ) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
        this.mlServiceUrl = mlServiceUrl;
    }

    public MLPredictionResponse predictMood(String text) {
        String endpoint = mlServiceUrl + "/api/ml/predict";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = Collections.singletonMap("text", text);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<MLPredictionResponse> response = restTemplate.postForEntity(
                    endpoint, request, MLPredictionResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("ML Service unavailable at {}. Applying resilient fallback: {}", endpoint, e.getMessage());
        }

        // Resilient fallback rule if ML service is temporarily restarting
        return generateFallbackPrediction(text);
    }

    public Map<String, Object> uploadDatasetToML(MultipartFile file) {
        String endpoint = mlServiceUrl + "/api/ml/datasets/upload";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, requestEntity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to forward dataset to ML service: {}", e.getMessage());
            throw new RuntimeException("ML service dataset upload failed: " + e.getMessage());
        }
    }

    public Map<String, Object> validateDatasetInML(String datasetName, String textCol, String labelCol) {
        String endpoint = mlServiceUrl + "/api/ml/datasets/" + datasetName + "/validate";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = new HashMap<>();
            body.put("text_column", textCol);
            body.put("label_column", labelCol);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, request, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Dataset validation failed: {}", e.getMessage());
            throw new RuntimeException("Dataset validation failed: " + e.getMessage());
        }
    }

    public Map<String, Object> trainModelInML(String datasetName, String textCol, String labelCol, String algorithm, Double testSize) {
        String endpoint = mlServiceUrl + "/api/ml/train";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("dataset_name", datasetName);
            body.put("text_column", textCol);
            body.put("label_column", labelCol);
            body.put("algorithm", algorithm != null ? algorithm : "LOGISTIC_REGRESSION");
            body.put("test_size", testSize != null ? testSize : 0.2);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, request, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Model training failed: {}", e.getMessage());
            throw new RuntimeException("Model training failed: " + e.getMessage());
        }
    }

    public List<Map<String, Object>> getModelVersionsFromML() {
        String endpoint = mlServiceUrl + "/api/ml/models";
        try {
            ResponseEntity<List> response = restTemplate.getForEntity(endpoint, List.class);
            return response.getBody();
        } catch (Exception e) {
            log.warn("Could not fetch models from ML service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public Map<String, Object> activateModelInML(String modelId) {
        String endpoint = mlServiceUrl + "/api/ml/models/" + modelId + "/activate";
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, null, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to activate model {}: {}", modelId, e.getMessage());
            throw new RuntimeException("Model activation failed: " + e.getMessage());
        }
    }

    private MLPredictionResponse generateFallbackPrediction(String text) {
        MLPredictionResponse res = new MLPredictionResponse();
        String lower = text != null ? text.toLowerCase() : "";
        Map<String, Object> scores = new HashMap<>();

        if (lower.contains("happy") || lower.contains("joy") || lower.contains("good") || lower.contains("great") || lower.contains("calm")) {
            res.setPredictedMood("Joy");
            res.setSentiment("POSITIVE");
            res.setConfidence(0.82);
            res.setReflectionInsight("What specific moment brought you the most joy today?");
            scores.put("Joy", 0.82);
            scores.put("Calm", 0.10);
            scores.put("Neutral", 0.08);
        } else if (lower.contains("sad") || lower.contains("depressed") || lower.contains("cry") || lower.contains("hurt")) {
            res.setPredictedMood("Sadness");
            res.setSentiment("NEGATIVE");
            res.setConfidence(0.80);
            res.setReflectionInsight("Be gentle with yourself right now. What is one small comfort you can give yourself today?");
            scores.put("Sadness", 0.80);
            scores.put("Neutral", 0.12);
            scores.put("Anxiety", 0.08);
        } else if (lower.contains("angry") || lower.contains("mad") || lower.contains("furious") || lower.contains("annoyed")) {
            res.setPredictedMood("Anger");
            res.setSentiment("NEGATIVE");
            res.setConfidence(0.85);
            res.setReflectionInsight("What boundary or value felt crossed to trigger this reaction?");
            scores.put("Anger", 0.85);
            scores.put("Neutral", 0.15);
        } else if (lower.contains("anxious") || lower.contains("panic") || lower.contains("fear") || lower.contains("worry")) {
            res.setPredictedMood("Anxiety");
            res.setSentiment("NEGATIVE");
            res.setConfidence(0.83);
            res.setReflectionInsight("Try grounding yourself: take three slow, deep breaths and notice your surroundings.");
            scores.put("Anxiety", 0.83);
            scores.put("Sadness", 0.10);
            scores.put("Neutral", 0.07);
        } else {
            res.setPredictedMood("Neutral");
            res.setSentiment("NEUTRAL");
            res.setConfidence(0.70);
            res.setReflectionInsight("What was an ordinary moment today that you appreciated?");
            scores.put("Neutral", 0.70);
            scores.put("Calm", 0.20);
            scores.put("Joy", 0.10);
        }

        res.setEmotionScores(scores);
        res.setModelVersion("fallback-analyzer");
        res.setModelName("Fallback Heuristic Analyzer");
        return res;
    }
}
