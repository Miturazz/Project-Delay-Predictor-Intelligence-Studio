import React, { useState } from 'react';
import {
  EvaluationMetrics,
  FeatureImportance,
  MLModelType,
  ModelHyperparameters,
} from '../types/ml';
import { TrainingLossAndConfusionChart } from './TrainingLossAndConfusionChart';

interface ModelStudioProps {
  metrics: EvaluationMetrics | null;
  featureImportances: FeatureImportance[];
  modelType: MLModelType;
  setModelType: (type: MLModelType) => void;
  hyperparameters: ModelHyperparameters;
  onUpdateHyperparameters: (hp: Partial<ModelHyperparameters>) => void;
  onRetrain: () => void;
  isTraining: boolean;
  trainingEpoch: number;
  trainingLoss: number;
}

export const ModelStudio: React.FC<ModelStudioProps> = ({
  metrics,
  featureImportances,
  modelType,
  setModelType,
  hyperparameters,
  onUpdateHyperparameters,
  onRetrain,
  isTraining,
  trainingEpoch,
  trainingLoss,
}) => {
  const [activeCurveTab, setActiveCurveTab] = useState<'roc' | 'pr'>('roc');
  const [hoveredRocPoint, setHoveredRocPoint] = useState<{ fpr: number; tpr: number; threshold: number } | null>(null);

  if (!metrics) {
    return (
      <div className="p-12 text-center text-slate-400">
        <span>Model metrics are loading...</span>
      </div>
    );
  }

  const { confusionMatrix } = metrics;
  const currentThreshold = hyperparameters.decisionThreshold;

  return (
    <div className="space-y-8">
      {/* Top Banner & Algorithm Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Model Architecture &amp; Validation Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervised machine learning algorithms trained on historical delivery records, team productivity, and organizational size metrics.
          </p>
        </div>

        {/* Algorithm Segmented Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setModelType('ensemble')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              modelType === 'ensemble'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Stacked Ensemble
          </button>
          <button
            onClick={() => setModelType('gbdt')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              modelType === 'gbdt'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gradient Boosted (GBDT)
          </button>
          <button
            onClick={() => setModelType('random_forest')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              modelType === 'random_forest'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Random Forest
          </button>
          <button
            onClick={() => setModelType('logistic_regression')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              modelType === 'logistic_regression'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            L2 Logistic Regression
          </button>
        </div>
      </div>

      {/* Top Level Metric Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">AUC-ROC Score</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-emerald-400">
            {metrics.rocAuc.toFixed(3)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Discriminative power</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">PR-AUC Score</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-cyan-400">
            {metrics.prAuc.toFixed(3)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Precision-Recall area</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">F1-Score</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-indigo-400">
            {metrics.f1Score.toFixed(3)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Harmonic mean P/R</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Precision</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-white">
            {(metrics.precision * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Delay forecast accuracy</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Recall (Sensitivity)</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-white">
            {(metrics.recall * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Delayed projects flagged</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Specificity</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-white">
            {(metrics.specificity * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">On-time true negative rate</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Log-Loss</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-slate-300">
            {metrics.logLoss.toFixed(3)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cross-entropy penalty</div>
        </div>
      </div>

      {/* Recharts Visualization: Training Loss over Epochs & Interactive Confusion Matrix */}
      <TrainingLossAndConfusionChart
        metrics={metrics}
        hyperparameters={hyperparameters}
        onUpdateHyperparameters={onUpdateHyperparameters}
      />

      {/* Discriminative Curves: ROC and Precision-Recall */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Receiver Operating Characteristic &amp; Precision-Recall</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              Hold-out Validation Cohort (N={metrics.confusionMatrix.total})
            </span>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-md">
            <button
              onClick={() => setActiveCurveTab('roc')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeCurveTab === 'roc'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ROC Curve (AUC: {metrics.rocAuc.toFixed(3)})
            </button>
            <button
              onClick={() => setActiveCurveTab('pr')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeCurveTab === 'pr'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Precision-Recall (AUC: {metrics.prAuc.toFixed(3)})
            </button>
          </div>
        </div>

        {/* SVG Curve Canvas */}
        <div className="py-2">
          <div className="relative w-full aspect-[21/9] max-h-72">
            <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="rocGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((tick) => {
                const y = 200 - tick * 170;
                const x = 50 + tick * 520;
                return (
                  <g key={tick}>
                    <line x1="50" y1={y} x2="570" y2={y} stroke="#1e293b" strokeDasharray="3,3" />
                    <line x1={x} y1="30" x2={x} y2="200" stroke="#1e293b" strokeDasharray="3,3" />
                    <text x="42" y={y + 3} textAnchor="end" className="text-[9px] fill-slate-500 font-mono">
                      {(tick * 100).toFixed(0)}%
                    </text>
                    <text x={x} y="215" textAnchor="middle" className="text-[9px] fill-slate-500 font-mono">
                      {(tick * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}

              {/* Axis Labels */}
              <text x="310" y="234" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">
                {activeCurveTab === 'roc' ? 'False Positive Rate (1 - Specificity)' : 'Recall (True Positive Rate)'}
              </text>
              <text x="-115" y="14" transform="rotate(-90)" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">
                {activeCurveTab === 'roc' ? 'True Positive Rate (Sensitivity)' : 'Precision (Positive Predictive Value)'}
              </text>

              {/* Random Baseline diagonal for ROC */}
              {activeCurveTab === 'roc' && (
                <line x1="50" y1="200" x2="570" y2="30" stroke="#475569" strokeDasharray="4,4" />
              )}

              {/* Main Curve */}
              {activeCurveTab === 'roc' ? (
                <>
                  <path
                    d={`M 50 200 ${metrics.rocCurve
                      .map((p) => `L ${50 + p.fpr * 520} ${200 - p.tpr * 170}`)
                      .join(' ')} L 570 30 L 570 200 Z`}
                    fill="url(#rocGradient)"
                  />
                  <path
                    d={`M 50 200 ${metrics.rocCurve
                      .map((p) => `L ${50 + p.fpr * 520} ${200 - p.tpr * 170}`)
                      .join(' ')}`}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2.5"
                  />

                  {/* Threshold Operating Point Marker */}
                  {(() => {
                    const opFpr = 1 - metrics.specificity;
                    const opTpr = metrics.recall;
                    const cx = 50 + opFpr * 520;
                    const cy = 200 - opTpr * 170;
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r="6" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                        <circle cx={cx} cy={cy} r="12" fill="#6366f1" fillOpacity="0.2" className="animate-pulse" />
                      </g>
                    );
                  })()}
                </>
              ) : (
                <>
                  <path
                    d={`M 50 ${200 - (metrics.prCurve[0]?.precision || 0.5) * 170} ${metrics.prCurve
                      .map((p) => `L ${50 + p.recall * 520} ${200 - p.precision * 170}`)
                      .join(' ')}`}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                  />
                </>
              )}
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block" />
            <span>Operating threshold marker: <span className="font-mono tabular-nums text-white font-medium">&tau; = {currentThreshold.toFixed(2)}</span></span>
          </div>
          <span>Sensitivity / Specificity balance derived from hold-out validation set</span>
        </div>
      </div>

      {/* Feature Importance & Model Weights */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Global Feature Importance &amp; Risk Attribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Relative predictive weight of team productivity, size, and project variables in determining delivery delays.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Productivity</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              <span>Team Size &amp; Org</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Project Scope</span>
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {featureImportances.map((item, idx) => {
            const barColor =
              item.category === 'Productivity'
                ? 'bg-cyan-500'
                : item.category === 'Team Size'
                ? 'bg-indigo-500'
                : 'bg-amber-500';

            return (
              <div key={item.featureKey} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 text-[11px] w-4">{idx + 1}.</span>
                    <span className="text-slate-200 font-medium">{item.label}</span>
                    <span className="text-[11px] text-slate-500">
                      ({item.direction === 'increases_delay' ? 'Risk Accelerator' : 'Risk Reducer'})
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-slate-400">
                    {(item.importance * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-300`}
                    style={{ width: `${Math.max(3, item.importance * 100 * 3.5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
