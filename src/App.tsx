import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ProjectData, EvaluationMetrics, FeatureImportance, ModelHyperparameters, MLModelType, PredictionResult } from './types/ml';
import { generateHistoricalDataset, PRESET_PROJECTS } from './ml/dataset';
import { mlEngine } from './ml/engine';
import { Header, ActiveTab } from './components/Header';
import { LivePredictor } from './components/LivePredictor';
import { ModelStudio } from './components/ModelStudio';
import { DatasetExplorer } from './components/DatasetExplorer';
import { ExplainabilityView } from './components/ExplainabilityView';
import { ExportView } from './components/ExportView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('predictor');
  const [dataset, setDataset] = useState<ProjectData[]>(() => generateHistoricalDataset(1200));
  const [currentProject, setCurrentProject] = useState<ProjectData>(() => PRESET_PROJECTS[0]);
  const [modelType, setModelType] = useState<MLModelType>('ensemble');
  const [hyperparameters, setHyperparameters] = useState<ModelHyperparameters>(() => mlEngine.getHyperparameters());
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [featureImportances, setFeatureImportances] = useState<FeatureImportance[]>([]);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingEpoch, setTrainingEpoch] = useState<number>(0);
  const [trainingLoss, setTrainingLoss] = useState<number>(0);

  // Train the model
  const runTraining = useCallback((datasetToTrain = dataset, currentHp = hyperparameters, type = modelType) => {
    setIsTraining(true);
    mlEngine.setModelType(type);
    mlEngine.setHyperparameters(currentHp);

    setTimeout(() => {
      const evalMetrics = mlEngine.train(datasetToTrain, (epoch, loss) => {
        setTrainingEpoch(epoch);
        setTrainingLoss(loss);
      });
      setMetrics(evalMetrics);
      setFeatureImportances(mlEngine.getFeatureImportances());
      setIsTraining(false);
    }, 150);
  }, [dataset, hyperparameters, modelType]);

  // Initial training run on mount
  useEffect(() => {
    runTraining(dataset, hyperparameters, modelType);
  }, []);

  // Update model type
  const handleModelTypeChange = (newType: MLModelType) => {
    setModelType(newType);
    runTraining(dataset, hyperparameters, newType);
  };

  // Update hyperparameters
  const handleUpdateHyperparameters = (hp: Partial<ModelHyperparameters>) => {
    const updated = { ...hyperparameters, ...hp };
    setHyperparameters(updated);
    mlEngine.setHyperparameters(updated);

    // If only decisionThreshold changed, re-evaluate without retraining
    if (Object.keys(hp).length === 1 && hp.decisionThreshold !== undefined) {
      const newMetrics = mlEngine.evaluateModel();
      setMetrics(newMetrics);
    } else {
      runTraining(dataset, updated, modelType);
    }
  };

  // Live prediction computation
  const currentPrediction: PredictionResult = useMemo(() => {
    return mlEngine.predict(currentProject);
  }, [currentProject, metrics, modelType, hyperparameters.decisionThreshold]);

  // Project update handler
  const handleProjectChange = (updated: ProjectData) => {
    setCurrentProject(updated);
  };

  // Dataset project addition
  const handleAddProject = (newProject: ProjectData) => {
    const updatedDataset = [newProject, ...dataset];
    setDataset(updatedDataset);
    runTraining(updatedDataset, hyperparameters, modelType);
  };

  // Select project from dataset for live analysis
  const handleSelectProjectForPrediction = (project: ProjectData) => {
    setCurrentProject(project);
    setActiveTab('predictor');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetCount={dataset.length}
        isTraining={isTraining}
        onRetrain={() => runTraining(dataset, hyperparameters, modelType)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'predictor' && (
          <LivePredictor
            currentProject={currentProject}
            prediction={currentPrediction}
            onChangeProject={handleProjectChange}
          />
        )}

        {activeTab === 'model_studio' && (
          <ModelStudio
            metrics={metrics}
            featureImportances={featureImportances}
            modelType={modelType}
            setModelType={handleModelTypeChange}
            hyperparameters={hyperparameters}
            onUpdateHyperparameters={handleUpdateHyperparameters}
            onRetrain={() => runTraining(dataset, hyperparameters, modelType)}
            isTraining={isTraining}
            trainingEpoch={trainingEpoch}
            trainingLoss={trainingLoss}
          />
        )}

        {activeTab === 'explainability' && (
          <ExplainabilityView currentProject={currentProject} />
        )}

        {activeTab === 'dataset' && (
          <DatasetExplorer
            dataset={dataset}
            onSelectProjectForPrediction={handleSelectProjectForPrediction}
            onAddProject={handleAddProject}
          />
        )}

        {activeTab === 'export' && (
          <ExportView modelType={modelType} hyperparameters={hyperparameters} />
        )}
      </main>

      {/* Clean, quiet footer adhering to design constitution */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">ChronosML</span>
            <span aria-hidden="true">&bull;</span>
            <span>Enterprise Large-Scale Project Delay Machine Learning Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px] tabular-nums">
            <span>Model: GBDT / Ensemble</span>
            <span aria-hidden="true">&bull;</span>
            <span>Dataset: {dataset.length} Empirical Programs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
