import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import { EvaluationMetrics, ModelHyperparameters } from '../types/ml';
import { Sliders, TrendingDown, CheckCircle2, AlertCircle, ShieldAlert, Target } from 'lucide-react';

interface TrainingLossAndConfusionChartProps {
  metrics: EvaluationMetrics;
  hyperparameters: ModelHyperparameters;
  onUpdateHyperparameters: (hp: Partial<ModelHyperparameters>) => void;
}

export const TrainingLossAndConfusionChart: React.FC<TrainingLossAndConfusionChartProps> = ({
  metrics,
  hyperparameters,
  onUpdateHyperparameters,
}) => {
  const [lossViewMode, setLossViewMode] = useState<'both' | 'train' | 'val'>('both');
  const [activeConfusionTab, setActiveConfusionTab] = useState<'matrix' | 'barchart'>('matrix');

  const { trainingHistory, confusionMatrix } = metrics;
  const currentThreshold = hyperparameters.decisionThreshold;

  // Calculate loss reduction stats
  const initialLoss = trainingHistory[0]?.trainLoss || 0.693;
  const finalLoss = trainingHistory[trainingHistory.length - 1]?.trainLoss || metrics.logLoss;
  const lossDeltaPercent = initialLoss > 0 ? Math.max(0, ((initialLoss - finalLoss) / initialLoss) * 100) : 0;

  // Confusion matrix rates
  const tp = confusionMatrix.truePositives;
  const fp = confusionMatrix.falsePositives;
  const tn = confusionMatrix.trueNegatives;
  const fn = confusionMatrix.falseNegatives;
  const total = confusionMatrix.total || 1;

  const actualDelayedTotal = tp + fn || 1;
  const actualOnTimeTotal = tn + fp || 1;

  const tpRate = ((tp / actualDelayedTotal) * 100).toFixed(1);
  const fnRate = ((fn / actualDelayedTotal) * 100).toFixed(1);
  const tnRate = ((tn / actualOnTimeTotal) * 100).toFixed(1);
  const fpRate = ((fp / actualOnTimeTotal) * 100).toFixed(1);

  // Data for Recharts Confusion Matrix Bar distribution
  const confusionBarData = [
    {
      name: 'True Negatives (TN)',
      count: tn,
      percentage: ((tn / total) * 100).toFixed(1),
      category: 'Correctly On-Time',
      color: '#10b981', // emerald
      description: 'Accurately anticipated on-time delivery; budget & schedule preserved.',
    },
    {
      name: 'False Positives (FP)',
      count: fp,
      percentage: ((fp / total) * 100).toFixed(1),
      category: 'False Alarm',
      color: '#f59e0b', // amber
      description: 'Predicted delay, but delivered on-time; led to unnecessary contingency planning.',
    },
    {
      name: 'False Negatives (FN)',
      count: fn,
      percentage: ((fn / total) * 100).toFixed(1),
      category: 'Missed Delay',
      color: '#f43f5e', // rose
      description: 'Predicted on-time, but delayed; critical risk causing unbudgeted schedule shock!',
    },
    {
      name: 'True Positives (TP)',
      count: tp,
      percentage: ((tp / total) * 100).toFixed(1),
      category: 'Accurately Flagged',
      color: '#6366f1', // indigo
      description: 'Successfully identified at-risk projects for preventative PM governance.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 2-Column Responsive Grid: Training Loss Chart on Left, Confusion Matrix on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recharts Training Loss Curve (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/50 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-cyan-400" />
                  <span>Training Loss Over Epochs</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gradient descent optimization log-loss convergence across training epochs.
                </p>
              </div>

              {/* View Selector */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-md text-xs">
                <button
                  onClick={() => setLossViewMode('both')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    lossViewMode === 'both' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Train &amp; Val
                </button>
                <button
                  onClick={() => setLossViewMode('train')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    lossViewMode === 'train' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Train Only
                </button>
                <button
                  onClick={() => setLossViewMode('val')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    lossViewMode === 'val' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Val Only
                </button>
              </div>
            </div>

            {/* Recharts Area Chart for Loss */}
            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trainingHistory}
                  margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="trainLossGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="valLossGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="epoch"
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `Ep ${val}`}
                  />
                  <YAxis
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => Number(val).toFixed(2)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '0.375rem',
                      fontSize: '11px',
                      color: '#f8fafc',
                    }}
                    formatter={(value: any, name: any) => [
                      Number(value).toFixed(3),
                      name === 'trainLoss' ? 'Training Log-Loss' : name === 'valLoss' ? 'Validation Log-Loss' : 'Accuracy',
                    ]}
                    labelFormatter={(label) => `Epoch ${label}`}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                  />
                  {(lossViewMode === 'both' || lossViewMode === 'train') && (
                    <Area
                      type="monotone"
                      dataKey="trainLoss"
                      name="Train Loss"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#trainLossGrad)"
                    />
                  )}
                  {(lossViewMode === 'both' || lossViewMode === 'val') && (
                    <Area
                      type="monotone"
                      dataKey="valLoss"
                      name="Val Loss"
                      stroke="#a855f7"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#valLossGrad)"
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    name="Accuracy"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Loss Convergence Summary Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Loss Reduction:</span>
              <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                -{lossDeltaPercent.toFixed(1)}%
              </span>
              <span className="text-[11px] text-slate-500">
                ({initialLoss.toFixed(3)} &rarr; {finalLoss.toFixed(3)})
              </span>
            </div>
            <span className="font-mono tabular-nums text-[11px] text-slate-500">
              {trainingHistory.length} Epochs Converged
            </span>
          </div>
        </div>

        {/* Right Column: Recharts Confusion Matrix & Accuracy Interpretation (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/50 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-indigo-400" />
                  <span>Confusion Matrix &amp; Accuracy Breakdown</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evaluate classification error types across hold-out validation set (N={total}).
                </p>
              </div>

              {/* View Switch */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-md text-xs">
                <button
                  onClick={() => setActiveConfusionTab('matrix')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    activeConfusionTab === 'matrix' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  2&times;2 Grid
                </button>
                <button
                  onClick={() => setActiveConfusionTab('barchart')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    activeConfusionTab === 'barchart' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Recharts Distribution
                </button>
              </div>
            </div>

            {/* Dynamic View: 2x2 Grid OR Recharts Distribution Bar Chart */}
            {activeConfusionTab === 'matrix' ? (
              <div className="space-y-4">
                {/* 2x2 Matrix Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* True Negative */}
                  <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-lg">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-medium text-emerald-300">True Negative (TN)</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-mono tabular-nums font-bold text-white">
                        {tn}
                      </span>
                      <span className="text-xs font-mono text-emerald-400">
                        ({tnRate}% Specificity)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Actual &amp; Predicted <strong className="text-emerald-300">On-Time</strong>.
                    </p>
                  </div>

                  {/* False Positive */}
                  <div className="p-3.5 bg-amber-950/20 border border-amber-800/40 rounded-lg">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-medium text-amber-300">False Alarm (FP)</span>
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-mono tabular-nums font-bold text-white">
                        {fp}
                      </span>
                      <span className="text-xs font-mono text-amber-400">
                        ({fpRate}% False Alarm)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Predicted Delay, but actually <strong className="text-amber-300">On-Time</strong>.
                    </p>
                  </div>

                  {/* False Negative */}
                  <div className="p-3.5 bg-rose-950/20 border border-rose-800/40 rounded-lg">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-medium text-rose-300">Missed Delay (FN)</span>
                      <ShieldAlert className="h-4 w-4 text-rose-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-mono tabular-nums font-bold text-white">
                        {fn}
                      </span>
                      <span className="text-xs font-mono text-rose-400">
                        ({fnRate}% Miss Rate)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Predicted On-Time, but actually <strong className="text-rose-300">Delayed</strong>!
                    </p>
                  </div>

                  {/* True Positive */}
                  <div className="p-3.5 bg-indigo-950/20 border border-indigo-800/40 rounded-lg">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-medium text-indigo-300">True Positive (TP)</span>
                      <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-mono tabular-nums font-bold text-white">
                        {tp}
                      </span>
                      <span className="text-xs font-mono text-indigo-400">
                        ({tpRate}% Recall)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Actual &amp; Predicted <strong className="text-indigo-300">Delayed</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Recharts Distribution Bar Chart */
              <div className="w-full h-56 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={confusionBarData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#475569" fontSize={11} tickLine={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090d16',
                        borderColor: '#334155',
                        borderRadius: '0.375rem',
                        fontSize: '11px',
                        color: '#f8fafc',
                      }}
                      formatter={(val: any, _name: any, item: any) => [
                        `${val} projects (${item.payload.percentage}%)`,
                        item.payload.category,
                      ]}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {confusionBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Threshold Slider Control */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Operating Decision Threshold</span>
                </div>
                <span className="font-mono tabular-nums text-indigo-300 font-semibold">
                  &tau; = {currentThreshold.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.90"
                step="0.02"
                value={currentThreshold}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateHyperparameters({ decisionThreshold: val });
                }}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>0.10 (Aggressive Warning)</span>
                <span>0.50 (Balanced)</span>
                <span>0.90 (Conservative)</span>
              </div>
            </div>
          </div>

          {/* Accuracy Interpretation Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Overall Accuracy:</span>
              <span className="font-mono tabular-nums text-white font-semibold">
                {((tn + tp) / total * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">MCC:</span>
              <span className="font-mono tabular-nums text-slate-300">
                {metrics.mcc.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
