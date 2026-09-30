import React, { useState, useMemo } from 'react';
import { ProjectData, ProjectDomain } from '../types/ml';
import { DOMAINS, exportDatasetToCSV, evaluateDataGeneratingProcess } from '../ml/dataset';
import {
  Search,
  Download,
  Plus,
  Play,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';

interface DatasetExplorerProps {
  dataset: ProjectData[];
  onSelectProjectForPrediction: (project: ProjectData) => void;
  onAddProject: (newProject: ProjectData) => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  dataset,
  onSelectProjectForPrediction,
  onAddProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'delayed' | 'ontime'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New project form state
  const [newProjectForm, setNewProjectForm] = useState<Partial<ProjectData>>({
    projectName: '',
    domain: 'Enterprise ERP & Core',
    plannedDurationMonths: 18,
    budgetMillions: 20.0,
    requirementsVolatility: 30,
    dependencyCount: 10,
    techNoveltyRisk: 3,
    earlyMilestoneSlippage: 5,
    sprintVelocity: 35,
    velocityReliability: 75,
    overtimeHoursPerWeek: 6,
    approvalLatencyDays: 2.5,
    stakeholderLatencyDays: 12,
    teamSize: 45,
    seniorJuniorRatio: 0.35,
    annualAttritionRate: 12,
    newHireRampRatio: 15,
    podModularity: 3,
  });

  // Filtered dataset
  const filteredData = useMemo(() => {
    return dataset.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.projectName.toLowerCase().includes(q);
        const matchesDomain = item.domain.toLowerCase().includes(q);
        if (!matchesName && !matchesDomain) return false;
      }
      if (selectedDomain !== 'all' && item.domain !== selectedDomain) {
        return false;
      }
      if (selectedStatus === 'delayed' && item.isDelayed !== 1) return false;
      if (selectedStatus === 'ontime' && item.isDelayed !== 0) return false;
      return true;
    });
  }, [dataset, searchQuery, selectedDomain, selectedStatus]);

  // Statistics
  const totalCount = dataset.length;
  const delayedCount = dataset.filter((d) => d.isDelayed === 1).length;
  const onTimeCount = totalCount - delayedCount;
  const delayRate = totalCount > 0 ? (delayedCount / totalCount) * 100 : 0;
  const avgTeamSize = Math.round(dataset.reduce((acc, d) => acc + d.teamSize, 0) / (totalCount || 1));
  const avgBudget = Math.round((dataset.reduce((acc, d) => acc + d.budgetMillions, 0) / (totalCount || 1)) * 10) / 10;

  const handleExportCSV = () => {
    const csvContent = exportDatasetToCSV(dataset);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `chronosml_project_delay_dataset_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectForm.projectName) return;

    const evalResult = evaluateDataGeneratingProcess({
      id: `custom-${Date.now()}`,
      projectName: newProjectForm.projectName,
      domain: newProjectForm.domain as ProjectDomain,
      plannedDurationMonths: Number(newProjectForm.plannedDurationMonths),
      budgetMillions: Number(newProjectForm.budgetMillions),
      requirementsVolatility: Number(newProjectForm.requirementsVolatility),
      dependencyCount: Number(newProjectForm.dependencyCount),
      techNoveltyRisk: Number(newProjectForm.techNoveltyRisk),
      earlyMilestoneSlippage: Number(newProjectForm.earlyMilestoneSlippage),
      sprintVelocity: Number(newProjectForm.sprintVelocity),
      velocityReliability: Number(newProjectForm.velocityReliability),
      overtimeHoursPerWeek: Number(newProjectForm.overtimeHoursPerWeek),
      approvalLatencyDays: Number(newProjectForm.approvalLatencyDays),
      stakeholderLatencyDays: Number(newProjectForm.stakeholderLatencyDays),
      teamSize: Number(newProjectForm.teamSize),
      seniorJuniorRatio: Number(newProjectForm.seniorJuniorRatio),
      annualAttritionRate: Number(newProjectForm.annualAttritionRate),
      newHireRampRatio: Number(newProjectForm.newHireRampRatio),
      podModularity: Number(newProjectForm.podModularity),
    });

    const fullProject: ProjectData = {
      id: `custom-${Date.now()}`,
      projectName: newProjectForm.projectName,
      domain: newProjectForm.domain as ProjectDomain,
      plannedDurationMonths: Number(newProjectForm.plannedDurationMonths),
      budgetMillions: Number(newProjectForm.budgetMillions),
      requirementsVolatility: Number(newProjectForm.requirementsVolatility),
      dependencyCount: Number(newProjectForm.dependencyCount),
      techNoveltyRisk: Number(newProjectForm.techNoveltyRisk),
      earlyMilestoneSlippage: Number(newProjectForm.earlyMilestoneSlippage),
      sprintVelocity: Number(newProjectForm.sprintVelocity),
      velocityReliability: Number(newProjectForm.velocityReliability),
      overtimeHoursPerWeek: Number(newProjectForm.overtimeHoursPerWeek),
      approvalLatencyDays: Number(newProjectForm.approvalLatencyDays),
      stakeholderLatencyDays: Number(newProjectForm.stakeholderLatencyDays),
      teamSize: Number(newProjectForm.teamSize),
      seniorJuniorRatio: Number(newProjectForm.seniorJuniorRatio),
      annualAttritionRate: Number(newProjectForm.annualAttritionRate),
      newHireRampRatio: Number(newProjectForm.newHireRampRatio),
      podModularity: Number(newProjectForm.podModularity),
      brooksOverheadIndex: evalResult.brooksIndex,
      isDelayed: evalResult.isDelayed,
      actualDelayMonths: evalResult.actualDelayMonths,
      completionStatus: evalResult.isDelayed === 1 ? 'Delayed' : 'On-Time',
    };

    onAddProject(fullProject);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Dataset Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Historical Project Management Dataset
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Empirical delivery archives across Aerospace, Core ERP, Banking, Healthcare, Cloud, and Megaprojects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Project</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Stat Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Total Archived Projects</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-white">
            {totalCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Historical cohort</div>
        </div>

        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Empirical Delay Rate</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-amber-400">
            {delayRate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{delayedCount} slipped / {onTimeCount} on-time</div>
        </div>

        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Average Team Size</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-slate-200">
            {avgTeamSize} <span className="text-xs text-slate-400 font-normal">FTEs</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Per active program</div>
        </div>

        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Average Budget</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-slate-200">
            ${avgBudget}M
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Capital investment</div>
        </div>

        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Industry Domains</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-cyan-400">
            6
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cross-sector coverage</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects by initiative title or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Domain Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-500 hidden sm:inline" />
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Domains</option>
            {DOMAINS.map((dom) => (
              <option key={dom} value={dom}>
                {dom}
              </option>
            ))}
          </select>

          {/* Status Segmented Buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-md">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('delayed')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                selectedStatus === 'delayed'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Delayed
            </button>
            <button
              onClick={() => setSelectedStatus('ontime')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                selectedStatus === 'ontime'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              On-Time
            </button>
          </div>
        </div>
      </div>

      {/* High Density Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-medium z-10">
              <tr>
                <th className="py-2.5 px-4">Project Title</th>
                <th className="py-2.5 px-3">Domain</th>
                <th className="py-2.5 px-3 text-right">Team Size</th>
                <th className="py-2.5 px-3 text-right">Senior Ratio</th>
                <th className="py-2.5 px-3 text-right">Reliability</th>
                <th className="py-2.5 px-3 text-right">Overtime</th>
                <th className="py-2.5 px-3 text-right">Scope Churn</th>
                <th className="py-2.5 px-3 text-right">Duration</th>
                <th className="py-2.5 px-3">Outcome</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredData.slice(0, 100).map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-2 px-4 font-medium text-slate-200 max-w-[220px] truncate">
                    {row.projectName}
                  </td>
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                    {row.domain}
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-300">
                    {row.teamSize} <span className="text-[10px] text-slate-500">FTE</span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-300">
                    {(row.seniorJuniorRatio * 100).toFixed(0)}%
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-300">
                    {row.velocityReliability}%
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-300">
                    {row.overtimeHoursPerWeek}h
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-300">
                    {row.requirementsVolatility}%
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-300">
                    {row.plannedDurationMonths}m
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 ${
                        row.isDelayed === 1 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {row.isDelayed === 1 ? (
                        <>
                          <AlertTriangle className="h-3 w-3" />
                          <span>Delayed (+{row.actualDelayMonths}m)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>On-Time</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectProjectForPrediction(row)}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium group-hover:underline"
                    >
                      <span>Analyze</span>
                      <Play className="h-2.5 w-2.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white font-mono">{Math.min(100, filteredData.length)}</strong> of{' '}
            <strong className="text-white font-mono">{filteredData.length}</strong> matching records
          </span>
          <span className="text-[11px] text-slate-500">
            Click &quot;Analyze&quot; on any row to import directly into the Live Predictor
          </span>
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white">Add Historical / Active Project Record</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Project Orion: Core Billing Engine"
                    value={newProjectForm.projectName || ''}
                    onChange={(e) =>
                      setNewProjectForm({ ...newProjectForm, projectName: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Domain</label>
                  <select
                    value={newProjectForm.domain}
                    onChange={(e) =>
                      setNewProjectForm({
                        ...newProjectForm,
                        domain: e.target.value as ProjectDomain,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {DOMAINS.map((dom) => (
                      <option key={dom} value={dom}>
                        {dom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Core Team Size (FTEs)</label>
                  <input
                    type="number"
                    min="4"
                    max="500"
                    value={newProjectForm.teamSize || 40}
                    onChange={(e) =>
                      setNewProjectForm({ ...newProjectForm, teamSize: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Senior-to-Junior Ratio (0.1 to 0.8)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    max="0.85"
                    value={newProjectForm.seniorJuniorRatio || 0.3}
                    onChange={(e) =>
                      setNewProjectForm({ ...newProjectForm, seniorJuniorRatio: parseFloat(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Sprint Commitment Reliability (%)</label>
                  <input
                    type="number"
                    min="40"
                    max="100"
                    value={newProjectForm.velocityReliability || 75}
                    onChange={(e) =>
                      setNewProjectForm({ ...newProjectForm, velocityReliability: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Weekly Overtime (hrs/wk)</label>
                  <input
                    type="number"
                    min="0"
                    max="35"
                    value={newProjectForm.overtimeHoursPerWeek || 6}
                    onChange={(e) =>
                      setNewProjectForm({ ...newProjectForm, overtimeHoursPerWeek: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Requirements Volatility (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="95"
                    value={newProjectForm.requirementsVolatility || 30}
                    onChange={(e) =>
                      setNewProjectForm({ ...newProjectForm, requirementsVolatility: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Planned Duration (Months)</label>
                  <input
                    type="number"
                    min="4"
                    max="72"
                    value={newProjectForm.plannedDurationMonths || 18}
                    onChange={(e) =>
                      setNewProjectForm({ ...newProjectForm, plannedDurationMonths: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
                >
                  Add &amp; Calculate Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
