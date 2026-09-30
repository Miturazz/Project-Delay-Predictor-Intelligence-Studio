import React, { useState } from 'react';
import { ModelHyperparameters, MLModelType } from '../types/ml';
import { generatePythonMLScript, generateFastApiServingScript } from '../ml/codeGenerator';
import { Code2, Copy, Check, Download, Server, Terminal } from 'lucide-react';

interface ExportViewProps {
  modelType: MLModelType;
  hyperparameters: ModelHyperparameters;
}

export const ExportView: React.FC<ExportViewProps> = ({ modelType, hyperparameters }) => {
  const [activeTab, setActiveTab] = useState<'python_train' | 'fastapi_serve'>('python_train');
  const [copied, setCopied] = useState(false);

  const pythonScript = generatePythonMLScript(modelType, hyperparameters);
  const apiScript = generateFastApiServingScript();
  const currentCode = activeTab === 'python_train' ? pythonScript : apiScript;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === 'python_train' ? 'train_chronos_delay_model.py' : 'serve_chronos_api.py';
    const blob = new Blob([currentCode], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Production Python &amp; REST Microservice Export
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Export full Scikit-Learn / XGBoost pipeline code with cross-validation and FastAPI production endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Script'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .py</span>
          </button>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
        {/* Tab switch */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('python_train')}
              className={`flex items-center gap-2 px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === 'python_train'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>train_chronos_delay_model.py</span>
            </button>
            <button
              onClick={() => setActiveTab('fastapi_serve')}
              className={`flex items-center gap-2 px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === 'fastapi_serve'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="h-3.5 w-3.5" />
              <span>serve_chronos_api.py (FastAPI)</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-500">Python 3.10+ / Scikit-Learn / XGBoost</span>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 overflow-x-auto max-h-[550px] font-mono text-xs leading-relaxed text-slate-300">
          <pre>{currentCode}</pre>
        </div>
      </div>

      {/* Integration Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-2">
          <div className="font-semibold text-white flex items-center gap-2">
            <span className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
            <span>Install Dependencies</span>
          </div>
          <p className="text-slate-400">
            Ensure Python virtual environment has required ML packages:
          </p>
          <div className="p-2 bg-slate-950 rounded font-mono text-[11px] text-indigo-300">
            pip install scikit-learn xgboost pandas joblib fastapi uvicorn
          </div>
        </div>

        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-2">
          <div className="font-semibold text-white flex items-center gap-2">
            <span className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
            <span>Train &amp; Validate Pipeline</span>
          </div>
          <p className="text-slate-400">
            Execute training on exported dataset. Fits 5-fold cross-validation and dumps pipeline:
          </p>
          <div className="p-2 bg-slate-950 rounded font-mono text-[11px] text-indigo-300">
            python train_chronos_delay_model.py
          </div>
        </div>

        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-2">
          <div className="font-semibold text-white flex items-center gap-2">
            <span className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
            <span>Serve Production Endpoints</span>
          </div>
          <p className="text-slate-400">
            Deploy FastAPI microservice to connect with Jira, Linear, or Azure DevOps:
          </p>
          <div className="p-2 bg-slate-950 rounded font-mono text-[11px] text-indigo-300">
            uvicorn serve_chronos_api:app --port 8000
          </div>
        </div>
      </div>
    </div>
  );
};
