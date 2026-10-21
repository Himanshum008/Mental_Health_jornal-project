package com.mentalhealth.journal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ml_model_versions")
public class MLModelVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_id_str", unique = true, length = 100)
    private String modelIdStr;

    @Column(name = "model_name", nullable = false)
    private String modelName;

    @Column(name = "version_tag", length = 30)
    private String versionTag;

    @Column(length = 60)
    private String algorithm;

    @Column(name = "dataset_name")
    private String datasetName;

    private Double accuracy;

    @Column(name = "precision_score")
    private Double precisionScore;

    @Column(name = "recall_score")
    private Double recallScore;

    @Column(name = "f1_score")
    private Double f1Score;

    @Column(name = "confusion_matrix_json", columnDefinition = "TEXT")
    private String confusionMatrixJson;

    @Column(name = "class_distribution_json", columnDefinition = "TEXT")
    private String classDistributionJson;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @Column(name = "trained_at")
    private LocalDateTime trainedAt;

    public MLModelVersion() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.trainedAt == null) {
            this.trainedAt = LocalDateTime.now();
        }
        if (this.isActive == null) {
            this.isActive = false;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getModelIdStr() {
        return modelIdStr;
    }

    public void setModelIdStr(String modelIdStr) {
        this.modelIdStr = modelIdStr;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getVersionTag() {
        return versionTag;
    }

    public void setVersionTag(String versionTag) {
        this.versionTag = versionTag;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public String getDatasetName() {
        return datasetName;
    }

    public void setDatasetName(String datasetName) {
        this.datasetName = datasetName;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }

    public Double getPrecisionScore() {
        return precisionScore;
    }

    public void setPrecisionScore(Double precisionScore) {
        this.precisionScore = precisionScore;
    }

    public Double getRecallScore() {
        return recallScore;
    }

    public void setRecallScore(Double recallScore) {
        this.recallScore = recallScore;
    }

    public Double getF1Score() {
        return f1Score;
    }

    public void setF1Score(Double f1Score) {
        this.f1Score = f1Score;
    }

    public String getConfusionMatrixJson() {
        return confusionMatrixJson;
    }

    public void setConfusionMatrixJson(String confusionMatrixJson) {
        this.confusionMatrixJson = confusionMatrixJson;
    }

    public String getClassDistributionJson() {
        return classDistributionJson;
    }

    public void setClassDistributionJson(String classDistributionJson) {
        this.classDistributionJson = classDistributionJson;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public LocalDateTime getTrainedAt() {
        return trainedAt;
    }

    public void setTrainedAt(LocalDateTime trainedAt) {
        this.trainedAt = trainedAt;
    }
}
