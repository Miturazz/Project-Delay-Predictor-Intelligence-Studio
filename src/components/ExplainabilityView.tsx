import React, { useState } from 'react';
import { ProjectData } from '../types/ml';
import { mlEngine } from '../ml/engine';
import { Sparkles, Sliders, Layers, AlertCircle, Compass } from 'lucide-react';

interface ExplainabilityViewProps {
  currentProject: ProjectData;
}

export const ExplainabilityView: React.FC<ExplainabilityViewProps> = ({ currentProject }) => {
  const [selectedFeature, setSelectedFeature] = useState<keyof ProjectData>('teamSize');

  const pdpData = mlEngine.getPartialDependence(selectedFeature, currentProject);

  const availableFeatures: Array<{ key: keyof ProjectData; label: string; category: string; description: string }> = [
    {
      key: 'teamSize',
      label: "Team Size (Brooks' Law)",
      category: 'Team Size',
      description: "Non-linear communication overhead penalty scaling with N*(N-1)/2.",
    },
    {
      key: 'annualAttritionRate',
      label: 'Annual Team Attrition (%/yr)',
      category: 'Team Size',
      description: 'Loss of domain context and architectural memory driving schedule slippage.',
    },
    {
      key: 'overtimeHoursPerWeek',
      label: 'Weekly Overtime (Burnout Curve)',
      category: 'Productivity',
      description: 'The fatigue inflection point: >12h/wk overtime causes rework spirals.',
    },
    {
      key: 'requirementsVolatility',
      label: 'Requirements Volatility / Scope Churn',
      category: 'Project Management',
      description: 'Continuous requirement modifications invalidating sprint roadmaps.',
    },
    {
      key: 'seniorJuniorRatio',
      label: 'Senior-to-Junior Ratio',
      category: 'Team Size',
      description: 'Capacity to review code, debug blockers, and mentor junior engineers.',
    },
    {
      key: 'velocityReliability',
      label: 'Sprint Commitment Reliability (%)',
      category: 'Productivity',
      description: 'Predictability and confidence in sprint delivery milestones.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Explainable AI (XAI) &amp; Partial Dependence Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Isolate non-linear marginal effects and inspect how key productivity and team metrics mathematically sway the delay probability.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>Model-Agnostic Partial Dependence (PDP)</span>
        </div>
      </div>

      {/* Feature Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {availableFeatures.map((f) => (
          <button
            key={f.key}
            onClick={() => setSelectedFeature(f.key)}
            className={`p-3 text-left rounded-lg border transition-all ${
              selectedFeature === f.key
                ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-xs'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="text-[11px] text-indigo-400 font-medium">{f.category}</div>
            <div className="text-xs font-semibold text-slate-200 mt-1 truncate">{f.label}</div>
          </button>
        ))}
      </div>

      {/* Main PDP Curve Display */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-indigo-400" />
              <span>Partial Dependence Curve: {pdpData.label}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Marginal effect on Delay Probability when varying {pdpData.label} while holding all other current project parameters fixed.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span>Current Project: <strong className="text-white">{pdpData.currentValue}</strong></span>
            </span>
          </div>
        </div>

        {/* SVG Curve */}
        <div className="relative w-full aspect-[21/9] max-h-80">
          <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="pdpGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Threshold horizontal guides */}
            {/* 50% Threshold line */}
            <line x1="50" y1="120" x2="570" y2="120" stroke="#f43f5e" strokeDasharray="4,4" strokeOpacity="0.6" />
            <text x="575" y="123" className="text-[10px] fill-rose-400 font-mono">50% Delay Threshold</text>

            {/* Y axis lines (0%, 25%, 50%, 75%, 100%) */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = 200 - (val / 100) * 160;
              return (
                <g key={val}>
                  <line x1="50" y1={y} x2="570" y2={y} stroke="#1e293b" strokeDasharray="3,3" />
                  <text x="42" y={y + 3} textAnchor="end" className="text-[9px] fill-slate-500 font-mono">
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* X axis ticks */}
            {pdpData.points.map((pt, idx) => {
              if (idx % 4 !== 0 && idx !== pdpData.points.length - 1) return null;
              const x = 50 + (idx / (pdpData.points.length - 1)) * 520;
              return (
                <g key={idx}>
                  <line x1={x} y1="200" x2={x} y2="205" stroke="#475569" />
                  <text x={x} y="220" textAnchor="middle" className="text-[9px] fill-slate-500 font-mono">
                    {pt.value}
                  </text>
                </g>
              );
            })}

            {/* Filled Area */}
            <path
              d={`M 50 200 ${pdpData.points
                .map((pt, idx) => {
                  const x = 50 + (idx / (pdpData.points.length - 1)) * 520;
                  const y = 200 - (pt.delayProbability / 100) * 160;
                  return `L ${x} ${y}`;
                })
                .join(' ')} L 570 200 Z`}
              fill="url(#pdpGradient)"
            />

            {/* Line Plot */}
            <path
              d={`M 50 ${200 - (pdpData.points[0]?.delayProbability / 100) * 160} ${pdpData.points
                .map((pt, idx) => {
                  const x = 50 + (idx / (pdpData.points.length - 1)) * 520;
                  const y = 200 - (pt.delayProbability / 100) * 160;
                  return `L ${x} ${y}`;
                })
                .join(' ')}`}
              fill="none"
              stroke="#818cf8"
              strokeWidth="2.5"
            />

            {/* Current Value Marker */}
            {(() => {
              const minVal = pdpData.points[0]?.value || 0;
              const maxVal = pdpData.points[pdpData.points.length - 1]?.value || 100;
              const ratio = Math.max(0, Math.min(1, (pdpData.currentValue - minVal) / (maxVal - minVal || 1)));
              const markerX = 50 + ratio * 520;

              // Find closest point probability
              const closest = pdpData.points.reduce((prev, curr) =>
                Math.abs(curr.value - pdpData.currentValue) < Math.abs(prev.value - pdpData.currentValue) ? curr : prev
              );
              const markerY = 200 - (closest.delayProbability / 100) * 160;

              return (
                <g>
                  <line x1={markerX} y1="40" x2={markerX} y2="200" stroke="#6366f1" strokeDasharray="3,3" />
                  <circle cx={markerX} cy={markerY} r="6" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                  <rect
                    x={markerX - 35}
                    y={markerY - 26}
                    width="70"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke="#334155"
                  />
                  <text
                    x={markerX}
                    y={markerY - 14}
                    textAnchor="middle"
                    className="text-[9px] fill-white font-mono font-medium"
                  >
                    P: {closest.delayProbability}%
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Y-Axis: Marginal Probability of Delay (%) &bull; X-Axis: {pdpData.label}</span>
          <span className="text-slate-500">
            Calculated across {pdpData.points.length} evaluation points
          </span>
        </div>
      </div>

      {/* Feature Interaction Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-white">Brooks&apos; Law Non-Linear Modularity Interaction</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When team size expands past 50 engineers, the model applies non-linear communication drag $N(N-1)/2$. However, increasing <strong>Pod Modularity to 4 or 5</strong> (autonomous two-pizza pods) dampens this penalty by decoupling cross-pod dependencies into clean API contracts.
          </p>
          <div className="p-3 bg-slate-950/60 rounded border border-slate-800 text-[11px] text-slate-400">
            <strong className="text-slate-200">Recommendation:</strong> Never scale headcount beyond 40 FTEs without simultaneously investing in autonomous microservices/squad architecture.
          </div>
        </div>

        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <h4 className="text-sm font-semibold text-white">Overtime Fatigue &amp; Defect Amplification</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The decision trees capture a steep inflection point around <strong>12 hours/week of overtime</strong>. While initial overtime temporarily boosts story point output, sustained overtime beyond 12h leads to an exponential increase in regression bugs, failed PR reviews, and catastrophic downstream rework.
          </p>
          <div className="p-3 bg-slate-950/60 rounded border border-slate-800 text-[11px] text-slate-400">
            <strong className="text-slate-200">Recommendation:</strong> Cap sprint overtime at 8h/week. Projects operating with &gt;15h overtime have an 82% empirical probability of schedule overrun.
          </div>
        </div>
      </div>
    </div>
  );
};
