package com.mentalhealth.journal.repository;

import com.mentalhealth.journal.entity.MoodAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MoodAnalysisRepository extends JpaRepository<MoodAnalysis, Long> {
    Optional<MoodAnalysis> findByJournalEntryId(Long journalEntryId);
}
