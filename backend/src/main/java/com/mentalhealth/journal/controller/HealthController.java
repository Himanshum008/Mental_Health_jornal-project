package com.mentalhealth.journal.controller;

import com.mentalhealth.journal.repository.UserRepository;
import com.mentalhealth.journal.service.MLClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final UserRepository userRepository;
    private final MLClientService mlClientService;

    public HealthController(UserRepository userRepository, MLClientService mlClientService) {
        this.userRepository = userRepository;
        this.mlClientService = mlClientService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "SereneMind Backend REST API");
        status.put("timestamp", Instant.now().toString());

        // Check database
        try {
            long userCount = userRepository.count();
            status.put("database", "CONNECTED (users=" + userCount + ")");
        } catch (Exception e) {
            status.put("database", "DISCONNECTED: " + e.getMessage());
        }

        // Check ML service
        try {
            boolean mlHealthy = mlClientService.isServiceHealthy();
            status.put("ml_service", mlHealthy ? "UP" : "DOWN");
        } catch (Exception e) {
            status.put("ml_service", "DOWN: " + e.getMessage());
        }

        return ResponseEntity.ok(status);
    }
}
