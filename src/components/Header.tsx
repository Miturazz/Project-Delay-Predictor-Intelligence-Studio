import React from 'react';
import { Sparkles, Database, Sliders, Cpu, Code2, LineChart } from 'lucide-react';

export type ActiveTab = 'predictor' | 'model_studio' | 'dataset' | 'explainability' | 'export';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  datasetCount: number;
  isTraining: boolean;
  onRetrain: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  datasetCount,
  isTraining,
  onRetrain,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
      {/* Zone 1: Brand Mark (Single clean typography element) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Cpu className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Chronos<span className="text-indigo-400">ML</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-3">
          <span>Project Delay Intelligence</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-300">{datasetCount} Projects</span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Text with active underlines / clean highlights) */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab('predictor')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'predictor'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Predictor &amp; What-If</span>
        </button>

        <button
          onClick={() => setActiveTab('model_studio')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'model_studio'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <LineChart className="h-3.5 w-3.5" />
          <span>Model Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('explainability')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'explainability'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>XAI &amp; Sensitivity</span>
        </button>

        <button
          onClick={() => setActiveTab('dataset')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'dataset'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Historical Dataset</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'export'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          <span>Python / API</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRetrain}
          disabled={isTraining}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 transition-colors whitespace-nowrap shadow-xs shadow-indigo-600/20"
        >
          {isTraining ? (
            <>
              <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Training Pipeline...</span>
            </>
          ) : (
            <>
              <Cpu className="h-3.5 w-3.5" />
              <span>Retrain Model</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
