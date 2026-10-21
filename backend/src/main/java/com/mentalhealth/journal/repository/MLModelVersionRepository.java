package com.mentalhealth.journal.repository;

import com.mentalhealth.journal.entity.MLModelVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MLModelVersionRepository extends JpaRepository<MLModelVersion, Long> {
    List<MLModelVersion> findAllByOrderByTrainedAtDesc();

    Optional<MLModelVersion> findByModelIdStr(String modelIdStr);

    Optional<MLModelVersion> findFirstByIsActiveTrue();

    @Modifying
    @Query("UPDATE MLModelVersion m SET m.isActive = false")
    void deactivateAllModels();
}
