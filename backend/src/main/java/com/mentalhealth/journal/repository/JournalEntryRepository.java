package com.mentalhealth.journal.repository;

import com.mentalhealth.journal.entity.JournalEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    Page<JournalEntry> findByUserIdOrderByEntryDateDescCreatedAtDesc(Long userId, Pageable pageable);

    List<JournalEntry> findByUserIdOrderByEntryDateDesc(Long userId);

    List<JournalEntry> findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(Long userId, LocalDate startDate, LocalDate endDate);

    Optional<JournalEntry> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    @Query("SELECT j FROM JournalEntry j WHERE j.user.id = :userId AND " +
           "(:query IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.content) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.tags) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:mood IS NULL OR (j.moodAnalysis IS NOT NULL AND LOWER(j.moodAnalysis.predictedMood) = LOWER(:mood))) " +
           "ORDER BY j.entryDate DESC, j.createdAt DESC")
    Page<JournalEntry> searchUserJournals(
            @Param("userId") Long userId,
            @Param("query") String query,
            @Param("mood") String mood,
            Pageable pageable
    );
}
