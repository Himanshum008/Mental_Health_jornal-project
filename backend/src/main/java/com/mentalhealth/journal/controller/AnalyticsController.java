package com.mentalhealth.journal.controller;

import com.mentalhealth.journal.dto.AnalyticsSummaryDTO;
import com.mentalhealth.journal.entity.User;
import com.mentalhealth.journal.service.AnalyticsService;
import com.mentalhealth.journal.service.UserService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserService userService;

    public AnalyticsController(AnalyticsService analyticsService, UserService userService) {
        this.analyticsService = analyticsService;
        this.userService = userService;
    }

    private User getAuthenticatedUser(Authentication auth) {
        return userService.getByUsername(auth.getName());
    }

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsSummaryDTO> getOverview(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(analyticsService.getSummary(user));
    }

    @GetMapping("/trends")
    public ResponseEntity<List<Map<String, Object>>> getTrends(
            Authentication auth,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(analyticsService.getMoodTrends(user, startDate, endDate));
    }

    @GetMapping("/calendar")
    public ResponseEntity<Map<String, Object>> getCalendar(
            Authentication auth,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}") int year,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getMonthValue()}") int month
    ) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(analyticsService.getMoodCalendar(user, year, month));
    }
}
