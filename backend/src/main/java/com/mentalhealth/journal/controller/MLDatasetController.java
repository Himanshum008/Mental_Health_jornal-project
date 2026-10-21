package com.mentalhealth.journal.controller;

import com.mentalhealth.journal.dto.MLPredictionResponse;
import com.mentalhealth.journal.entity.MLDataset;
import com.mentalhealth.journal.service.MLClientService;
import com.mentalhealth.journal.service.MLDatasetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ml")
public class MLDatasetController {

    private final MLDatasetService mlDatasetService;
    private final MLClientService mlClientService;

    public MLDatasetController(MLDatasetService mlDatasetService, MLClientService mlClientService) {
        this.mlDatasetService = mlDatasetService;
        this.mlClientService = mlClientService;
    }

    @PostMapping("/datasets/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MLDataset> uploadDataset(@RequestParam("file") MultipartFile file) {
        MLDataset dataset = mlDatasetService.uploadDataset(file);
        return ResponseEntity.ok(dataset);
    }

    @GetMapping("/datasets")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MLDataset>> getAllDatasets() {
        return ResponseEntity.ok(mlDatasetService.getAllDatasets());
    }

    @PostMapping("/datasets/{datasetName}/validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> validateDataset(
            @PathVariable String datasetName,
            @RequestBody Map<String, String> payload
    ) {
        String textCol = payload.get("text_column");
        String labelCol = payload.get("label_column");
        return ResponseEntity.ok(mlDatasetService.validateDataset(datasetName, textCol, labelCol));
    }

    @PostMapping("/train")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> trainModel(@RequestBody Map<String, Object> payload) {
        String datasetName = (String) payload.get("dataset_name");
        String textCol = (String) payload.get("text_column");
        String labelCol = (String) payload.get("label_column");
        String algorithm = (String) payload.get("algorithm");
        Double testSplit = payload.get("test_size") != null ? Double.valueOf(payload.get("test_size").toString()) : 0.2;

        return ResponseEntity.ok(mlDatasetService.trainModel(datasetName, textCol, labelCol, algorithm, testSplit));
    }

    @GetMapping("/models")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getModels() {
        return ResponseEntity.ok(mlDatasetService.getAllModels());
    }

    @PostMapping("/models/{modelId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> activateModel(@PathVariable String modelId) {
        return ResponseEntity.ok(mlDatasetService.activateModel(modelId));
    }

    @PostMapping("/predict")
    public ResponseEntity<MLPredictionResponse> predict(@RequestBody Map<String, String> payload) {
        String text = payload.get("text");
        return ResponseEntity.ok(mlClientService.predictMood(text));
    }
}
