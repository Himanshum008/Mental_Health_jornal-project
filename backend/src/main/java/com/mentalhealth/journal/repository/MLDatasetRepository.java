package com.mentalhealth.journal.repository;

import com.mentalhealth.journal.entity.MLDataset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MLDatasetRepository extends JpaRepository<MLDataset, Long> {
    List<MLDataset> findAllByOrderByUploadedAtDesc();
    Optional<MLDataset> findByOriginalFilename(String originalFilename);
}
