import React, { useState } from 'react';
import { ProjectData, PredictionResult, PrescriptiveIntervention } from '../types/ml';
import { PRESET_PROJECTS, calculateBrooksIndex } from '../ml/dataset';
import {
  AlertTriangle,
  CheckCircle,
  Users,
  Zap,
  Briefcase,
  ArrowRight,
  Sparkles,
  TrendingUp,
  RefreshCcw,
} from 'lucide-react';

interface LivePredictorProps {
  currentProject: ProjectData;
  prediction: PredictionResult;
  onChangeProject: (updated: ProjectData) => void;
}

export const LivePredictor: React.FC<LivePredictorProps> = ({
  currentProject,
  prediction,
  onChangeProject,
}) => {
  const [lateStaffAdded, setLateStaffAdded] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'productivity' | 'team_size' | 'project_mgmt'>('productivity');

  const handleFieldChange = (field: keyof ProjectData, value: number) => {
    const updated = { ...currentProject, [field]: value };
    if (field === 'teamSize' || field === 'podModularity') {
      const ts = field === 'teamSize' ? value : currentProject.teamSize;
      const mod = field === 'podModularity' ? value : currentProject.podModularity;
      updated.brooksOverheadIndex = calculateBrooksIndex(ts, mod);
    }
    onChangeProject(updated);
  };

  const handleLateStaffChange = (added: number) => {
    setLateStaffAdded(added);
    // Late staffing adds to team size, but also heavily degrades onboarding ramp ratio and communication complexity
    const baseTeamSize = currentProject.teamSize;
    const newTeamSize = Math.max(5, baseTeamSize + added);
    const newRampRatio = added > 0 ? Math.min(65, currentProject.newHireRampRatio + Math.round((added / newTeamSize) * 60)) : currentProject.newHireRampRatio;
    const brooks = calculateBrooksIndex(newTeamSize, currentProject.podModularity);

    onChangeProject({
      ...currentProject,
      teamSize: newTeamSize,
      newHireRampRatio: newRampRatio,
      brooksOverheadIndex: brooks,
    });
  };

  const handleLoadPreset = (preset: ProjectData) => {
    setLateStaffAdded(0);
    onChangeProject({ ...preset });
  };

  const applyIntervention = (intervention: PrescriptiveIntervention) => {
    if (intervention.title.includes('Scope Freeze')) {
      handleFieldChange('requirementsVolatility', Math.max(15, currentProject.requirementsVolatility - 20));
    } else if (intervention.title.includes('Two-Pizza Squads') || intervention.title.includes('Decouple')) {
      handleFieldChange('podModularity', 4);
    } else if (intervention.title.includes('Senior Technical Leads') || intervention.title.includes('Rebalance')) {
      handleFieldChange('seniorJuniorRatio', Math.min(0.6, currentProject.seniorJuniorRatio + 0.15));
    } else if (intervention.title.includes('Overtime')) {
      handleFieldChange('overtimeHoursPerWeek', 4);
    } else if (intervention.title.includes('CI Gates') || intervention.title.includes('Review')) {
      handleFieldChange('approvalLatencyDays', 1.5);
    } else if (intervention.title.includes('Vendor Dependencies')) {
      handleFieldChange('dependencyCount', Math.max(4, currentProject.dependencyCount - 8));
    }
  };

  const delayPercent = Math.round(prediction.delayProbability * 100);
  const isDelayed = prediction.predictedStatus === 'Delayed';

  const riskBadgeColor =
    prediction.riskTier === 'Critical Delay Risk'
      ? 'text-rose-400 bg-rose-950/40 border-rose-800/60'
      : prediction.riskTier === 'Elevated Risk'
      ? 'text-amber-400 bg-amber-950/40 border-amber-800/60'
      : prediction.riskTier === 'Moderate Risk'
      ? 'text-yellow-400 bg-yellow-950/40 border-yellow-800/60'
      : 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';

  return (
    <div className="space-y-8">
      {/* Header and Preset Quick-Select */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Live Delay Inference &amp; What-If Simulation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate real-time schedule delay probability and model feature attribution across productivity and organizational levers.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1">Presets:</span>
          {PRESET_PROJECTS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset)}
              className={`px-2.5 py-1 text-xs rounded-md border transition-colors whitespace-nowrap ${
                currentProject.projectName === preset.projectName
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {preset.projectName.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Top Banner: Primary Inference Cockpit (Result & Gauge) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Probability Gauge & Verdict Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Predicted Delivery Status
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${riskBadgeColor}`}>
                {prediction.riskTier}
              </span>
            </div>

            <div className="py-6 flex flex-col items-center justify-center">
              {/* Radial Score Display */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#1e293b"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke={
                      isDelayed
                        ? delayPercent > 75
                          ? '#f43f5e'
                          : '#fbbf24'
                        : '#10b981'
                    }
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 * (1 - delayPercent / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-mono tabular-nums font-bold text-white tracking-tight">
                    {delayPercent}%
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Delay Probability
                  </span>
                </div>
              </div>

              {/* Status Outcome */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  {isDelayed ? (
                    <AlertTriangle className="h-5 w-5 text-rose-400" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  )}
                  <span className={`text-lg font-bold ${isDelayed ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isDelayed ? 'Project Will Delay' : 'Project Will Deliver On-Time'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isDelayed
                    ? `Estimated schedule slippage of +${prediction.predictedDelayMonths} months past contractual baseline.`
                    : `Estimated delivery within allocated ${currentProject.plannedDurationMonths} month baseline timeline.`}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-center">
            <div>
              <div className="text-[11px] text-slate-500">Planned Duration</div>
              <div className="text-sm font-mono tabular-nums font-semibold text-slate-200 mt-0.5">
                {currentProject.plannedDurationMonths} mo
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Projected Slippage</div>
              <div className="text-sm font-mono tabular-nums font-semibold text-slate-200 mt-0.5">
                {isDelayed ? `+${prediction.predictedDelayMonths} mo` : '0.0 mo'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Brooks Index</div>
              <div className="text-sm font-mono tabular-nums font-semibold text-slate-200 mt-0.5">
                {prediction.brooksIndex.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Local Feature Attribution (SHAP Waterfall) (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800 rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-semibold text-white">Local Feature Attribution (SHAP-Style)</span>
              </div>
              <span className="text-xs text-slate-400">Baseline Risk: ~25%</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 mb-4">
              Individual factor impact on this specific project. Positive values push toward delay; negative values protect the schedule.
            </p>

            {/* Waterfall List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {prediction.localExplanations.slice(0, 6).map((item) => {
                const isDelayDriver = item.attribution > 0;
                return (
                  <div
                    key={item.featureKey}
                    className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-md flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200">{item.label}</span>
                        <span className="text-[11px] text-slate-500">
                          (Val: {item.currentValue}, Avg: {item.baselineValue})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {item.impactDescription}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono tabular-nums font-semibold text-xs ${
                          isDelayDriver ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isDelayDriver ? `+${item.attribution}%` : `${item.attribution}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Model interpretability derived from trained ensemble attribution weights</span>
            <span>&bull; Top 6 drivers shown</span>
          </div>
        </div>
      </div>

      {/* Brooks' Law Interactive Simulator Box */}
      <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-semibold text-white">
              Brooks&apos; Law Stress Simulator: &quot;Adding people to a late project makes it later&quot;
            </span>
          </div>
          <span className="text-xs font-mono tabular-nums text-indigo-300">
            Current Team: {currentProject.teamSize} FTEs
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Test Frederick Brooks&apos; classic software engineering theorem. Adding team members late increases $N(N-1)/2$ communication channels and dilutes senior mentoring bandwidth.
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 whitespace-nowrap w-36">
              Late Staff Added: <strong className="text-white font-mono font-medium">+{lateStaffAdded} FTEs</strong>
            </span>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={lateStaffAdded}
              onChange={(e) => handleLateStaffChange(parseInt(e.target.value, 10))}
              className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            {lateStaffAdded > 0 && (
              <button
                onClick={() => handleLateStaffChange(0)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 border border-slate-700 px-2 py-1 rounded"
              >
                <RefreshCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Variables Controller: 3 Categories */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab('productivity')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'productivity'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Team Productivity Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('team_size')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'team_size'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Team Size &amp; Org Dynamics</span>
            </button>

            <button
              onClick={() => setActiveTab('project_mgmt')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'project_mgmt'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Project Management Data</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 hidden sm:inline">
            Modifying variables triggers real-time model inference
          </span>
        </div>

        {/* Tab 1: Team Productivity Metrics */}
        {activeTab === 'productivity' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Velocity Reliability */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Sprint Commitment Reliability</span>
                <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                  {currentProject.velocityReliability}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                % of committed sprint deliverables shipped and accepted. High reliability strongly shields against delays.
              </p>
              <input
                type="range"
                min="45"
                max="100"
                step="1"
                value={currentProject.velocityReliability}
                onChange={(e) => handleFieldChange('velocityReliability', parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Overtime & Burnout */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Overtime / Burnout Index</span>
                <span className="font-mono tabular-nums text-rose-400 font-semibold">
                  {currentProject.overtimeHoursPerWeek} hrs/wk
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Hours worked beyond 40h/wk. Values &gt;12h trigger fatigue, rework, and severe quality collapse.
              </p>
              <input
                type="range"
                min="0"
                max="28"
                step="1"
                value={currentProject.overtimeHoursPerWeek}
                onChange={(e) => handleFieldChange('overtimeHoursPerWeek', parseInt(e.target.value, 10))}
                className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* PR & Approval Latency */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Code Review &amp; PR Latency</span>
                <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                  {currentProject.approvalLatencyDays.toFixed(1)} days
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Turnaround latency for code reviews. Long review queues block dependent developer branches.
              </p>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.1"
                value={currentProject.approvalLatencyDays}
                onChange={(e) => handleFieldChange('approvalLatencyDays', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Sprint Velocity */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Sprint Velocity (Delivery Rate)</span>
                <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                  {currentProject.sprintVelocity} pts/mo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Historical delivery velocity per engineer per month.
              </p>
              <input
                type="range"
                min="10"
                max="60"
                step="1"
                value={currentProject.sprintVelocity}
                onChange={(e) => handleFieldChange('sprintVelocity', parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Stakeholder Latency */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Stakeholder Decision Wait Time</span>
                <span className="font-mono tabular-nums text-amber-400 font-semibold">
                  {currentProject.stakeholderLatencyDays} days
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Average wait time for business stakeholder or compliance sign-off on architecture gates.
              </p>
              <input
                type="range"
                min="1"
                max="45"
                step="1"
                value={currentProject.stakeholderLatencyDays}
                onChange={(e) => handleFieldChange('stakeholderLatencyDays', parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Team Size & Organizational Structure */}
        {activeTab === 'team_size' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Team Size */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Core Engineering Headcount</span>
                <span className="font-mono tabular-nums text-indigo-400 font-semibold">
                  {currentProject.teamSize} FTEs
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Total dedicated engineering and specialist staff. Large teams without modularity experience communication drag.
              </p>
              <input
                type="range"
                min="5"
                max="300"
                step="1"
                value={currentProject.teamSize}
                onChange={(e) => handleFieldChange('teamSize', parseInt(e.target.value, 10))}
                className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Senior/Junior Ratio */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Senior-to-Junior Ratio</span>
                <span className="font-mono tabular-nums text-indigo-400 font-semibold">
                  {(currentProject.seniorJuniorRatio * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Ratio of Staff/Lead engineers to junior staff. Low seniority ratio leaves teams fragile to technical surprises.
              </p>
              <input
                type="range"
                min="0.05"
                max="0.85"
                step="0.01"
                value={currentProject.seniorJuniorRatio}
                onChange={(e) => handleFieldChange('seniorJuniorRatio', parseFloat(e.target.value))}
                className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Annual Attrition */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Annual Turnover / Attrition</span>
                <span className="font-mono tabular-nums text-rose-400 font-semibold">
                  {currentProject.annualAttritionRate}%/yr
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Annual engineer churn rate. Values &gt;18% destroy tacit domain knowledge and create massive rework.
              </p>
              <input
                type="range"
                min="2"
                max="45"
                step="1"
                value={currentProject.annualAttritionRate}
                onChange={(e) => handleFieldChange('annualAttritionRate', parseInt(e.target.value, 10))}
                className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* New Hire Ramp Ratio */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Recent Onboarding Ramp Ratio</span>
                <span className="font-mono tabular-nums text-indigo-400 font-semibold">
                  {currentProject.newHireRampRatio}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                % of team hired in last 90 days. High onboarding proportions consume existing engineers&apos; velocity in training.
              </p>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={currentProject.newHireRampRatio}
                onChange={(e) => handleFieldChange('newHireRampRatio', parseInt(e.target.value, 10))}
                className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Pod Modularity */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Pod Modularity &amp; Squad Autonomy</span>
                <span className="font-mono tabular-nums text-indigo-400 font-semibold">
                  {currentProject.podModularity} / 5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                1 = Single monolithic hierarchy, 5 = Decoupled autonomous two-pizza pods (drastically mitigates Brooks&apos; Law).
              </p>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={currentProject.podModularity}
                onChange={(e) => handleFieldChange('podModularity', parseInt(e.target.value, 10))}
                className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Historical Project Management Baseline */}
        {activeTab === 'project_mgmt' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Planned Duration */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Baseline Planned Duration</span>
                <span className="font-mono tabular-nums text-amber-400 font-semibold">
                  {currentProject.plannedDurationMonths} months
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Contractual schedule target approved by sponsors and steering committee.
              </p>
              <input
                type="range"
                min="6"
                max="60"
                step="1"
                value={currentProject.plannedDurationMonths}
                onChange={(e) => handleFieldChange('plannedDurationMonths', parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Scope / Requirements Volatility */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Requirements Volatility (Scope Churn)</span>
                <span className="font-mono tabular-nums text-rose-400 font-semibold">
                  {currentProject.requirementsVolatility}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Frequency and magnitude of scope modifications after baseline freeze. Strongest historical delay predictor.
              </p>
              <input
                type="range"
                min="5"
                max="95"
                step="1"
                value={currentProject.requirementsVolatility}
                onChange={(e) => handleFieldChange('requirementsVolatility', parseInt(e.target.value, 10))}
                className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Dependency Count */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">External &amp; Vendor Dependencies</span>
                <span className="font-mono tabular-nums text-amber-400 font-semibold">
                  {currentProject.dependencyCount} deps
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Cross-system, third-party vendor, and sub-contractor critical path handoffs.
              </p>
              <input
                type="range"
                min="1"
                max="38"
                step="1"
                value={currentProject.dependencyCount}
                onChange={(e) => handleFieldChange('dependencyCount', parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Budget */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Allocated Budget</span>
                <span className="font-mono tabular-nums text-amber-400 font-semibold">
                  ${currentProject.budgetMillions.toFixed(1)}M
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Total capital and operational budget allocated to project.
              </p>
              <input
                type="range"
                min="1.0"
                max="250.0"
                step="0.5"
                value={currentProject.budgetMillions}
                onChange={(e) => handleFieldChange('budgetMillions', parseFloat(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Tech Novelty Risk */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Technology Stack Novelty</span>
                <span className="font-mono tabular-nums text-amber-400 font-semibold">
                  Level {currentProject.techNoveltyRisk} / 5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                1 = Battle-tested enterprise stack, 5 = Frontier / unproven research architecture.
              </p>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={currentProject.techNoveltyRisk}
                onChange={(e) => handleFieldChange('techNoveltyRisk', parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Early Milestone Slippage */}
            <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Early Milestone Gate Variance (25% Mark)</span>
                <span className="font-mono tabular-nums text-amber-400 font-semibold">
                  {currentProject.earlyMilestoneSlippage > 0 ? `+${currentProject.earlyMilestoneSlippage}%` : `${currentProject.earlyMilestoneSlippage}%`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Variance observed at early quarterly milestone gate. Leading indicator of terminal delay.
              </p>
              <input
                type="range"
                min="-15"
                max="55"
                step="1"
                value={currentProject.earlyMilestoneSlippage}
                onChange={(e) => handleFieldChange('earlyMilestoneSlippage', parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Prescriptive Interventions (Model Action Plan) */}
      {prediction.recommendedInterventions.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-white">
                Prescriptive Interventions: Model-Optimized De-Risking Actions
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Sensitivity-ranked actions to bring project delay probability below threshold
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prediction.recommendedInterventions.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-indigo-400 font-medium">{item.category}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono tabular-nums text-[11px]">
                      -{item.projectedRiskReduction}% Risk
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white mb-1.5">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.action}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    Projected delay: <strong className="text-slate-300 font-mono">{item.newDelayProbability}%</strong>
                  </div>
                  <button
                    onClick={() => applyIntervention(item)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:text-white bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-800/40 rounded transition-colors"
                  >
                    <span>Simulate</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
