package com.mentalhealth.journal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mentalhealth.journal.entity.MLDataset;
import com.mentalhealth.journal.entity.MLModelVersion;
import com.mentalhealth.journal.repository.MLDatasetRepository;
import com.mentalhealth.journal.repository.MLModelVersionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class MLDatasetService {

    private final MLDatasetRepository datasetRepository;
    private final MLModelVersionRepository modelRepository;
    private final MLClientService mlClient;
    private final ObjectMapper objectMapper;

    public MLDatasetService(
            MLDatasetRepository datasetRepository,
            MLModelVersionRepository modelRepository,
            MLClientService mlClient,
            ObjectMapper objectMapper
    ) {
        this.datasetRepository = datasetRepository;
        this.modelRepository = modelRepository;
        this.mlClient = mlClient;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public MLDataset uploadDataset(MultipartFile file) {
        Map<String, Object> mlResult = mlClient.uploadDatasetToML(file);

        MLDataset dataset = datasetRepository.findByOriginalFilename(file.getOriginalFilename())
                .orElse(new MLDataset());

        dataset.setOriginalFilename(file.getOriginalFilename());
        dataset.setFileSizeBytes(file.getSize());
        dataset.setTotalRows((Integer) mlResult.get("total_rows"));
        dataset.setTotalColumns((Integer) mlResult.get("total_columns"));
        dataset.setTextColumn((String) mlResult.get("suggested_text_column"));
        dataset.setLabelColumn((String) mlResult.get("suggested_label_column"));
        dataset.setStatus("UPLOADED");

        try {
            dataset.setColumnNamesJson(objectMapper.writeValueAsString(mlResult.get("columns")));
        } catch (Exception e) {
            dataset.setColumnNamesJson("[]");
        }

        return datasetRepository.save(dataset);
    }

    public List<MLDataset> getAllDatasets() {
        return datasetRepository.findAllByOrderByUploadedAtDesc();
    }

    @Transactional
    public Map<String, Object> validateDataset(String datasetName, String textCol, String labelCol) {
        Map<String, Object> valResult = mlClient.validateDatasetInML(datasetName, textCol, labelCol);

        datasetRepository.findByOriginalFilename(datasetName).ifPresent(ds -> {
            ds.setTextColumn(textCol);
            ds.setLabelColumn(labelCol);
            ds.setStatus("VALIDATED");
            datasetRepository.save(ds);
        });

        return valResult;
    }

    @Transactional
    public Map<String, Object> trainModel(String datasetName, String textCol, String labelCol, String algorithm, Double testSplit) {
        Map<String, Object> trainResult = mlClient.trainModelInML(datasetName, textCol, labelCol, algorithm, testSplit);

        if (trainResult != null && trainResult.containsKey("model")) {
            Map<String, Object> modelMeta = (Map<String, Object>) trainResult.get("model");
            MLModelVersion version = new MLModelVersion();
            version.setModelIdStr((String) modelMeta.get("id"));
            version.setModelName((String) modelMeta.get("name"));
            version.setVersionTag((String) modelMeta.get("version"));
            version.setAlgorithm((String) modelMeta.get("algorithm"));
            version.setDatasetName(datasetName);
            version.setAccuracy(modelMeta.get("accuracy") != null ? Double.valueOf(modelMeta.get("accuracy").toString()) : 0.0);
            version.setPrecisionScore(modelMeta.get("precision") != null ? Double.valueOf(modelMeta.get("precision").toString()) : 0.0);
            version.setRecallScore(modelMeta.get("recall") != null ? Double.valueOf(modelMeta.get("recall").toString()) : 0.0);
            version.setF1Score(modelMeta.get("f1_score") != null ? Double.valueOf(modelMeta.get("f1_score").toString()) : 0.0);
            version.setIsActive(Boolean.TRUE.equals(modelMeta.get("is_active")));

            try {
                version.setConfusionMatrixJson(objectMapper.writeValueAsString(modelMeta.get("confusion_matrix")));
                version.setClassDistributionJson(objectMapper.writeValueAsString(modelMeta.get("class_distribution")));
            } catch (Exception ignored) {
            }

            modelRepository.save(version);
        }

        return trainResult;
    }

    public List<Map<String, Object>> getAllModels() {
        return mlClient.getModelVersionsFromML();
    }

    @Transactional
    public Map<String, Object> activateModel(String modelId) {
        Map<String, Object> result = mlClient.activateModelInML(modelId);

        modelRepository.deactivateAllModels();
        modelRepository.findByModelIdStr(modelId).ifPresent(m -> {
            m.setIsActive(true);
            modelRepository.save(m);
        });

        return result;
    }
}
