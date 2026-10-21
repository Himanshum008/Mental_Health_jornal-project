package com.mentalhealth.journal.controller;

import com.mentalhealth.journal.dto.JournalRequest;
import com.mentalhealth.journal.dto.JournalResponse;
import com.mentalhealth.journal.entity.User;
import com.mentalhealth.journal.service.JournalService;
import com.mentalhealth.journal.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/journals")
public class JournalController {

    private final JournalService journalService;
    private final UserService userService;

    public JournalController(JournalService journalService, UserService userService) {
        this.journalService = journalService;
        this.userService = userService;
    }

    private User getAuthenticatedUser(Authentication auth) {
        return userService.getByUsername(auth.getName());
    }

    @PostMapping
    public ResponseEntity<JournalResponse> createEntry(
            Authentication auth,
            @Valid @RequestBody JournalRequest request
    ) {
        User user = getAuthenticatedUser(auth);
        JournalResponse response = journalService.createEntry(user, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<JournalResponse>> getEntries(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String mood
    ) {
        User user = getAuthenticatedUser(auth);
        Page<JournalResponse> entries = journalService.getUserJournals(user, page, size, search, mood);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JournalResponse> getEntryById(
            Authentication auth,
            @PathVariable Long id
    ) {
        User user = getAuthenticatedUser(auth);
        JournalResponse response = journalService.getJournalById(id, user);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JournalResponse> updateEntry(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody JournalRequest request
    ) {
        User user = getAuthenticatedUser(auth);
        JournalResponse response = journalService.updateJournal(id, user, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteEntry(
            Authentication auth,
            @PathVariable Long id
    ) {
        User user = getAuthenticatedUser(auth);
        journalService.deleteJournal(id, user);
        return ResponseEntity.ok(Collections.singletonMap("message", "Journal entry deleted successfully."));
    }
}
