import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';
import { ConfusionMatrix } from '../components/ConfusionMatrix';
import { MoodBadge } from '../components/MoodBadge';
import { 
  Cpu, 
  UploadCloud, 
  FileSpreadsheet, 
  Sliders, 
  CheckCircle2, 
  Play, 
  Zap, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle,
  Send,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';

export const MLTrainerPage = () => {
  const { user, isAdmin } = useAuth();

  // Datasets State
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [datasetDetails, setDatasetDetails] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Column Mapping & Preprocessing State
  const [textColumn, setTextColumn] = useState('');
  const [labelColumn, setLabelColumn] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);

  // Model Training State
  const [algorithm, setAlgorithm] = useState('LOGISTIC_REGRESSION');
  const [testSplit, setTestSplit] = useState(0.2);
  const [modelName, setModelName] = useState('');
  const [training, setTraining] = useState(false);
  const [trainingMetrics, setTrainingMetrics] = useState(null);

  // Model Versioning State
  const [models, setModels] = useState([]);
  const [activatingId, setActivatingId] = useState(null);

  // Live Test Playground State
  const [testText, setTestText] = useState('I am feeling so peaceful and grateful for today.');
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  // Global Notification / Error
  const [statusMessage, setStatusMessage] = useState(null);

  const normalizeDataset = (ds) => {
    if (!ds) return null;
    let cols = [];
    try {
      if (Array.isArray(ds.columns)) {
        cols = ds.columns;
      } else if (typeof ds.columnNamesJson === 'string') {
        cols = JSON.parse(ds.columnNamesJson);
      } else if (Array.isArray(ds.columnNamesJson)) {
        cols = ds.columnNamesJson;
      }
    } catch (e) {
      cols = ds.columns || [];
    }
    const name = ds.originalFilename || ds.name || ds.dataset_name;
    const textCol = ds.suggested_text || ds.textColumn || cols.find(c => ['journal_text', 'journal', 'statement', 'content', 'text'].includes(c.toLowerCase())) || cols[0] || '';
    const labelCol = ds.suggested_label || ds.labelColumn || cols.find(c => ['mood', 'emotion', 'primary_emotion', 'feeling', 'mental_state', 'status'].includes(c.toLowerCase())) || cols.find(c => ['sentiment', 'category'].includes(c.toLowerCase())) || (cols.length > 1 ? cols[1] : cols[0]) || '';
    return {
      ...ds,
      name,
      rows: ds.totalRows ?? ds.rows ?? 0,
      columns: cols,
      suggested_text: textCol,
      suggested_label: labelCol,
    };
  };

  const fetchDatasetsAndModels = async () => {
    try {
      const [rawDsList, modelList] = await Promise.all([
        api.getDatasets(),
        api.getModels(),
      ]);
      const dsList = (rawDsList || []).map(normalizeDataset).filter(Boolean);
      setDatasets(dsList);
      setModels(modelList || []);

      if (dsList.length > 0) {
        setSelectedDataset(prev => {
          const matched = dsList.find(d => d.name === prev) || dsList[0];
          handleSelectDataset(matched.name, dsList);
          return matched.name;
        });
      }
    } catch (err) {
      console.error("Failed to load ML state:", err);
    }
  };

  useEffect(() => {
    fetchDatasetsAndModels();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage(null);
    try {
      const rawRes = await api.uploadDataset(file);
      const res = normalizeDataset(rawRes);
      setStatusMessage({ type: 'success', text: `Dataset '${res.name}' uploaded successfully!` });
      await fetchDatasetsAndModels();
      if (res && res.name) {
        setSelectedDataset(res.name);
        handleSelectDataset(res.name);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Dataset upload failed.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSelectDataset = (dsName, list = datasets) => {
    setSelectedDataset(dsName);
    setValidationResult(null);
    setTrainingMetrics(null);

    // Find in datasets
    const ds = list.find(d => d.name === dsName);
    if (ds) {
      setDatasetDetails(ds);
      setTextColumn(ds.suggested_text || ds.columns?.[0] || '');
      setLabelColumn(ds.suggested_label || (ds.columns?.length > 1 ? ds.columns[1] : ds.columns?.[0]) || '');
    }
  };

  const handleValidateDataset = async () => {
    if (!selectedDataset || !textColumn || !labelColumn) {
      setStatusMessage({ type: 'error', text: 'Please choose both text and label columns.' });
      return;
    }

    setValidating(true);
    setStatusMessage(null);
    try {
      const result = await api.validateDataset(selectedDataset, textColumn, labelColumn);
      setValidationResult(result);
      setStatusMessage({ type: 'success', text: 'Dataset successfully validated and preprocessed!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Validation failed.' });
    } finally {
      setValidating(false);
    }
  };

  const handleTrainModel = async () => {
    if (!selectedDataset || !textColumn || !labelColumn) {
      setStatusMessage({ type: 'error', text: 'Please validate dataset columns first.' });
      return;
    }

    setTraining(true);
    setStatusMessage(null);
    try {
      const res = await api.trainModel({
        dataset_name: selectedDataset,
        text_column: textColumn,
        label_column: labelColumn,
        algorithm,
        test_size: Number(testSplit),
        model_name: modelName.trim() || undefined,
      });

      const trained = res.model || res;
      setTrainingMetrics(trained);
      setStatusMessage({ type: 'success', text: `Model '${trained.name || trained.id || 'Custom Model'}' successfully trained and evaluated!` });
      fetchDatasetsAndModels();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Model training failed.' });
    } finally {
      setTraining(false);
    }
  };

  const handleActivateModel = async (modelId) => {
    setActivatingId(modelId);
    try {
      await api.activateModel(modelId);
      setStatusMessage({ type: 'success', text: `Model '${modelId}' is now ACTIVE for live journal predictions!` });
      fetchDatasetsAndModels();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to activate model.' });
    } finally {
      setActivatingId(null);
    }
  };

  const handleTestPrediction = async (e) => {
    e.preventDefault();
    if (!testText.trim()) return;

    setPredicting(true);
    try {
      const res = await api.predictMood(testText);
      setPredictionResult(res);
    } catch (err) {
      alert("Prediction error: " + err.message);
    } finally {
      setPredicting(false);
    }
  };

  const activeModel = models.find(m => m.is_active);

  if (!isAdmin && user?.role !== 'ROLE_ADMIN') {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-3xl text-center space-y-4 shadow-sm animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin-Only Training Subsystem</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Access to model training, dataset ingestion, and active model deployment is restricted exclusively to system administrators (ROLE_ADMIN).
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Header & Active Model Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-purple-600" />
            <span>ML Model Studio & Training Subsystem</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic dataset ingestion, column selection, model training, evaluation, and instant activation.
          </p>
        </div>

        {/* Active Model Pill */}
        <div className="p-3 px-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div className="text-xs">
            <span className="text-purple-600 dark:text-purple-400 font-bold block">
              Active Serving Model:
            </span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              {activeModel ? `${activeModel.name} (${activeModel.version})` : 'Default Heuristic'}
            </span>
          </div>
        </div>
      </div>

      {/* Global Status Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 animate-slide-up ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Grid: Step 1 (Upload/Select Dataset) & Step 2 (Column Mapping) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Step 1: Upload / Pick Dataset */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center text-xs">1</span>
              <span>Dataset Upload & Selection</span>
            </h2>
            <span className="text-xs text-slate-400">CSV Formatted</span>
          </div>

          {/* Upload Dropzone */}
          <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center block cursor-pointer hover:border-purple-500 hover:bg-purple-50/20 dark:hover:bg-purple-950/10 transition-all">
            <UploadCloud className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              {uploading ? 'Uploading & parsing CSV...' : 'Click or Drag & Drop new CSV dataset here'}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Supports any column headers (e.g. emotion_dataset.csv, sentiment.csv)
            </span>
            <input
              type="file"
              accept=".csv"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Existing Datasets Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Available Datasets:
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {datasets.map((ds) => (
                <div
                  key={ds.name}
                  onClick={() => handleSelectDataset(ds.name)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    selectedDataset === ds.name
                      ? 'border-purple-500 bg-purple-50/50 text-purple-900 font-semibold dark:bg-purple-950/40 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-purple-500" />
                    <span>{ds.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {ds.rows} rows • {ds.columns?.length || 0} cols
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Dynamic Column Mapping & Health Validation */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center text-xs">2</span>
              <span>Column Mapping & Validation</span>
            </h2>
            <span className="text-xs text-slate-400">Schema-Agnostic</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Text Column (Journal Body)
              </label>
              <select
                value={textColumn}
                onChange={(e) => setTextColumn(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                {datasetDetails?.columns?.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Label Column (Mood/Sentiment)
              </label>
              <select
                value={labelColumn}
                onChange={(e) => setLabelColumn(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                {datasetDetails?.columns?.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 font-medium">
                💡 Tip: Choose <strong>mood</strong> or <strong>emotion</strong> for emotional states (e.g. Joy, Calm, Sadness, Fear) instead of generic sentiment.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleValidateDataset}
            disabled={validating || !selectedDataset}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300 flex items-center justify-center gap-2"
          >
            {validating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>Validate & Inspect Dataset</span>
          </button>

          {/* Validation Metrics Box */}
          {validationResult && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Cleaned Rows: <strong>{validationResult.cleaned_rows}</strong></span>
                <span>Dropped Rows: <strong>{validationResult.dropped_rows}</strong></span>
                <span>Distinct Classes: <strong>{validationResult.unique_classes}</strong></span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-1">
                {Object.entries(validationResult.class_distribution || {}).map(([cls, cnt]) => (
                  <span key={cls} className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-[10px] font-semibold">
                    {cls}: {cnt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Step 3: Model Configuration & Training Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center text-xs">3</span>
            <span>Configure & Train Classifier</span>
          </h2>
          <span className="text-xs text-slate-400">TF-IDF Vectorization Engine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Algorithm Option 1: Logistic Regression */}
          <div
            onClick={() => setAlgorithm('LOGISTIC_REGRESSION')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              algorithm === 'LOGISTIC_REGRESSION'
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Logistic Regression</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300">
                Recommended
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              High accuracy, smooth probabilistic confidence calibration for multi-emotion text classification.
            </p>
          </div>

          {/* Algorithm Option 2: Multinomial Naive Bayes */}
          <div
            onClick={() => setAlgorithm('NAIVE_BAYES')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              algorithm === 'NAIVE_BAYES'
                ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
              Multinomial Naive Bayes
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Blazing fast training, ideal for sparse n-gram frequency distributions and word frequency analysis.
            </p>
          </div>

          {/* Algorithm Option 3: Support Vector Machine (Linear SVM) */}
          <div
            onClick={() => setAlgorithm('SVM')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              algorithm === 'SVM'
                ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
              Support Vector Machine (Linear SVM)
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Maximum margin hyperplane separation with Platt scaling calibration for probability scores.
            </p>
          </div>

        </div>

        {/* Additional Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Model Name (Optional Custom Label)
            </label>
            <input
              type="text"
              placeholder="e.g. Production Emotion Classifier 2026"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Test Set Split Ratio: {Math.round(testSplit * 100)}% Test / {Math.round((1 - testSplit) * 100)}% Train
            </label>
            <input
              type="range"
              min="0.1"
              max="0.3"
              step="0.05"
              value={testSplit}
              onChange={(e) => setTestSplit(e.target.value)}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Train Trigger Button */}
        <button
          type="button"
          onClick={handleTrainModel}
          disabled={training || !selectedDataset}
          className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
        >
          {training ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Training Model on {selectedDataset}...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Train Model & Evaluate</span>
            </>
          )}
        </button>
      </div>

      {/* Step 4: Model Evaluation Results (Metrics & Confusion Matrix) */}
      {trainingMetrics && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-slide-up">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Model Evaluation Report: {trainingMetrics.name}</span>
              </h2>
              <span className="text-xs text-slate-400">
                Trained on {trainingMetrics.train_samples} samples, evaluated on {trainingMetrics.test_samples} test samples
              </span>
            </div>

            <button
              onClick={() => handleActivateModel(trainingMetrics.id)}
              className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Activate This Model Now</span>
            </button>
          </div>

          {/* Quantitative Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Accuracy</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {Math.round((trainingMetrics.accuracy || 0) * 1000) / 10}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Precision</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {Math.round((trainingMetrics.precision || 0) * 1000) / 10}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Recall</span>
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
                {Math.round((trainingMetrics.recall || 0) * 1000) / 10}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">F1-Score</span>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {Math.round((trainingMetrics.f1_score || 0) * 1000) / 10}%
              </span>
            </div>
          </div>

          {/* Confusion Matrix Heatmap */}
          {trainingMetrics.confusion_matrix && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <ConfusionMatrix data={trainingMetrics.confusion_matrix} />
            </div>
          )}
        </div>
      )}

      {/* Step 5: Model Versioning & Activation Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <span>Model Version History & Registry</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select and activate any previously trained version to instantly serve predictions.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Model Name</th>
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="py-2.5 px-3">Dataset</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {models.map((mod) => (
                <tr key={mod.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    {mod.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active Serving
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Inactive</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {mod.version}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {mod.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {mod.algorithm}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {mod.dataset_name}
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {mod.accuracy ? `${Math.round(mod.accuracy * 1000) / 10}%` : '-'}
                  </td>
                  <td className="py-3 px-3 font-semibold text-purple-600 dark:text-purple-400">
                    {mod.f1_score ? `${Math.round(mod.f1_score * 1000) / 10}%` : '-'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {mod.is_active ? (
                      <span className="text-[11px] font-semibold text-emerald-600">✓ In Use</span>
                    ) : (
                      <button
                        onClick={() => handleActivateModel(mod.id)}
                        disabled={activatingId === mod.id}
                        className="px-3 py-1 text-xs font-semibold rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-950 transition-all"
                      >
                        {activatingId === mod.id ? 'Activating...' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step 6: Live Prediction Testing Sandbox */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Real-Time Inference Playground</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Test the active model with any journal sentence to inspect emotion probabilities and predicted labels.
        </p>

        <form onSubmit={handleTestPrediction} className="flex gap-2">
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Type any test thoughts here..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={predicting}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center gap-1.5"
          >
            {predicting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Test Prediction</span>
          </button>
        </form>

        {predictionResult && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MoodBadge mood={predictionResult.predicted_mood} size="md" />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Sentiment: {predictionResult.sentiment}
                </span>
                <span className="text-slate-400">
                  (Certainty: {Math.round(predictionResult.confidence * 100)}%)
                </span>
              </div>
              <p className="text-purple-700 dark:text-purple-300 italic">
                "{predictionResult.reflection_insight}"
              </p>
            </div>

            <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 self-start sm:self-auto">
              Served by {predictionResult.model_name || predictionResult.model_version}
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
