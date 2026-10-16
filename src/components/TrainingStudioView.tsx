import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Save, Terminal, TrendingDown, Award, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { TrainingSimulator } from '../utils/trainingSimulator';
import { EpochRecord, TrainingHyperparameters } from '../types';
import { HAEMATOLOGY_CLASSES } from '../data/bloodCellsData';

interface TrainingStudioViewProps {
  device: string;
}

export const TrainingStudioView: React.FC<TrainingStudioViewProps> = ({ device }) => {
  const [simulator] = useState(() => new TrainingSimulator({ device: device as 'mps' | 'cuda' | 'cpu' }));
  const [params, setParams] = useState<TrainingHyperparameters>(simulator.getHyperparameters());
  const [history, setHistory] = useState<EpochRecord[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([
    `[INFO] Haematology production training environment initialized.`,
    `[INFO] Utilizing compute device: ${device.toUpperCase()}`,
    `[INFO] Model initialized with ResNet18 backbone, Dropout(p=0.5), and ${HAEMATOLOGY_CLASSES.length}-class Linear head.`,
    `[INFO] Optimizer: Adam (lr=${params.learningRate}), Scheduler: ReduceLROnPlateau (mode='min', factor=0.5, patience=3).`,
    `[INFO] Ready to train. Press 'Start Training Loop' or 'Step 1 Epoch'.`
  ]);
  const [speedMs, setSpeedMs] = useState<number>(600);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Training step ticker
  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        handleStep();
      }, speedMs);
    }
    return () => clearInterval(interval);
  }, [isRunning, history.length, params.epochs, speedMs]);

  const handleStep = () => {
    if (history.length >= params.epochs) {
      setIsRunning(false);
      setLogs((prev) => [...prev, `[COMPLETE] Reached maximum ${params.epochs} epochs. Training session finalized.`]);
      return;
    }

    const { record, logMessages } = simulator.stepEpoch();
    setHistory([...simulator.getHistory()]);

    const formattedLogs = [
      `Epoch [${record.epoch}/${params.epochs}] | Train Batches: ${record.batchesCompleted}/${record.totalBatches} | Train Loss: ${record.trainLoss.toFixed(4)}`,
      `-> Val Loss: ${record.valLoss.toFixed(4)} | Val Accuracy: ${record.valAccuracy.toFixed(2)}% | LR: ${record.lr}`,
      ...logMessages.map((msg) => `   ${msg}`),
      `----------------------------------------------------------------------`
    ];

    setLogs((prev) => [...prev, ...formattedLogs]);
  };

  const handleRunMultiple = (count: number) => {
    for (let i = 0; i < count; i++) {
      if (simulator.getHistory().length < params.epochs) {
        simulator.stepEpoch();
      }
    }
    setHistory([...simulator.getHistory()]);
    setLogs((prev) => [
      ...prev,
      `[BATCH STEP] Advanced ${count} epochs. Current epoch: ${simulator.getHistory().length}/${params.epochs}. Best Val Loss: ${simulator.getBestValLoss().toFixed(4)}`
    ]);
  };

  const handleReset = () => {
    setIsRunning(false);
    simulator.reset();
    setHistory([]);
    setLogs([
      `[RESET] Training state reset to Epoch 0. Weights cleared.`,
      `[INFO] Target classes: ${HAEMATOLOGY_CLASSES.length} | Device: ${device.toUpperCase()}`,
      `[INFO] Ready for new training sequence.`
    ]);
  };

  const handleExportWeights = () => {
    const checkpointData = {
      model_architecture: 'ResNet18_HaematologyClassifier',
      backbone: 'torchvision.models.resnet18',
      num_classes: HAEMATOLOGY_CLASSES.length,
      classes: HAEMATOLOGY_CLASSES.map(c => c.name),
      best_val_loss: simulator.getBestValLoss(),
      epochs_trained: history.length,
      final_lr: simulator.getCurrentLr(),
      hyperparameters: params,
      target_filename: 'haematology_production.pth',
      note: 'PyTorch state_dict format specification exported by HaemHelper'
    };

    const blob = new Blob([JSON.stringify(checkpointData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'haematology_production_metadata.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const latestRecord = history[history.length - 1];
  const bestLoss = simulator.getBestValLoss();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            <span>PyTorch 2.x • Transfer Learning Execution Loop</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Production Training Studio
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Simulates <code className="text-rose-300">train_haematology.py</code> with Adam optimizer, CrossEntropyLoss, and strict ReduceLROnPlateau validation monitoring.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isRunning ? (
            <button
              onClick={() => setIsRunning(false)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Training</span>
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(true)}
              disabled={history.length >= params.epochs}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Start Training Loop</span>
            </button>
          )}

          <button
            onClick={handleStep}
            disabled={isRunning || history.length >= params.epochs}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-all cursor-pointer"
            title="Execute 1 full epoch"
          >
            Step 1 Epoch
          </button>

          <button
            onClick={() => handleRunMultiple(5)}
            disabled={isRunning || history.length >= params.epochs}
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-all cursor-pointer"
            title="Fast forward 5 epochs"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>+5 Epochs</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer"
            title="Reset training"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4">
          <div className="text-xs text-slate-400 font-medium">Epoch Progress</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {history.length} <span className="text-xs text-slate-500 font-normal">/ {params.epochs}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{ width: `${(history.length / params.epochs) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Best Val Loss</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {bestLoss === Infinity ? '—' : bestLoss.toFixed(4)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {latestRecord?.isBestLoss ? '✓ Checkpoint updated' : 'Prev. optimal weight'}
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4">
          <div className="text-xs text-slate-400 font-medium">Validation Accuracy</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {latestRecord ? `${latestRecord.valAccuracy}%` : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {latestRecord ? `Train Loss: ${latestRecord.trainLoss}` : 'Awaiting 1st epoch'}
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4">
          <div className="text-xs text-slate-400 font-medium">Current Learning Rate</div>
          <div className="text-2xl font-bold font-mono text-teal-300 mt-1">
            {simulator.getCurrentLr()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ReduceLROnPlateau factor: {params.schedulerFactor}
          </div>
        </div>
      </div>

      {/* Main Grid: Loss & Accuracy Curves + PyTorch Terminal Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Loss / Accuracy Visualizations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Loss Curve SVG Graph */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-semibold text-white">
                  Loss Convergence: Train Loss vs. Validation Loss
                </h3>
              </div>
              <div className="flex items-center space-x-3 text-xs font-mono">
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                  <span className="text-slate-300">Train Loss</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                  <span className="text-slate-300">Val Loss</span>
                </div>
              </div>
            </div>

            {/* SVG Plot */}
            <div className="w-full h-56 bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 relative flex items-center justify-center">
              {history.length === 0 ? (
                <div className="text-center text-slate-500 text-xs">
                  Run training epochs to plot live CrossEntropy loss curves
                </div>
              ) : (
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="45" x2="500" y2="45" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="135" x2="500" y2="135" stroke="#1e293b" strokeDasharray="3 3" />
                  
                  {/* Train Loss Polyline */}
                  {(() => {
                    const maxLoss = 2.4;
                    const points = history.map((item, idx) => {
                      const x = (idx / Math.max(history.length - 1, 1)) * 480 + 10;
                      const y = 170 - (Math.min(item.trainLoss, maxLoss) / maxLoss) * 150;
                      return `${x},${y}`;
                    }).join(' ');
                    return <polyline fill="none" stroke="#818cf8" strokeWidth="2.5" points={points} />;
                  })()}

                  {/* Val Loss Polyline */}
                  {(() => {
                    const maxLoss = 2.4;
                    const points = history.map((item, idx) => {
                      const x = (idx / Math.max(history.length - 1, 1)) * 480 + 10;
                      const y = 170 - (Math.min(item.valLoss, maxLoss) / maxLoss) * 150;
                      return `${x},${y}`;
                    }).join(' ');
                    return <polyline fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="4 2" points={points} />;
                  })()}

                  {/* Best Checkpoint Markers */}
                  {history.map((item, idx) => {
                    if (!item.checkpointSaved) return null;
                    const maxLoss = 2.4;
                    const x = (idx / Math.max(history.length - 1, 1)) * 480 + 10;
                    const y = 170 - (Math.min(item.valLoss, maxLoss) / maxLoss) * 150;
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="4" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
              <span>Epoch 1</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Green dot = Checkpoint saved (haematology_production.pth)
              </span>
              <span>Epoch {params.epochs}</span>
            </div>
          </div>

          {/* Validation Accuracy Plot */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">
                Validation Accuracy Curve (%)
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {latestRecord ? `${latestRecord.valAccuracy}%` : '0%'}
              </span>
            </div>

            <div className="w-full h-32 bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 flex items-center justify-center">
              {history.length === 0 ? (
                <div className="text-center text-slate-500 text-xs">
                  Validation accuracy will populate during model evaluation
                </div>
              ) : (
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                  {/* Accuracy curve */}
                  {(() => {
                    const points = history.map((item, idx) => {
                      const x = (idx / Math.max(history.length - 1, 1)) * 480 + 10;
                      const y = 90 - ((item.valAccuracy - 35) / 65) * 80;
                      return `${x},${y}`;
                    }).join(' ');
                    return (
                      <>
                        <polygon
                          fill="rgba(16, 185, 129, 0.15)"
                          points={`10,90 ${points} 490,90`}
                        />
                        <polyline fill="none" stroke="#10b981" strokeWidth="2.5" points={points} />
                      </>
                    );
                  })()}
                </svg>
              )}
            </div>
          </div>

          {/* Model Weights Checkpoint Box */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">haematology_production.pth</h4>
                <p className="text-xs text-slate-400">
                  {bestLoss === Infinity
                    ? 'Awaiting first checkpoint save'
                    : `Optimal weights saved with Val Loss ${bestLoss.toFixed(4)}`}
                </p>
              </div>
            </div>

            <button
              onClick={handleExportWeights}
              disabled={history.length === 0}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer transition-all"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Checkpoint Specs</span>
            </button>
          </div>

        </div>

        {/* Right Column: Hyperparameter Controls & Terminal Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Hyperparameters Config Panel */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              PyTorch Hyperparameter Controls
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Batch Size (BATCH_SIZE)</label>
                <select
                  disabled={isRunning}
                  value={params.batchSize}
                  onChange={(e) => {
                    const bs = Number(e.target.value);
                    setParams(p => ({ ...p, batchSize: bs }));
                    simulator.updateHyperparameters({ batchSize: bs });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                >
                  <option value={16}>16</option>
                  <option value={32}>32 (Default)</option>
                  <option value={64}>64</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Max Epochs (EPOCHS)</label>
                <select
                  disabled={isRunning}
                  value={params.epochs}
                  onChange={(e) => {
                    const ep = Number(e.target.value);
                    setParams(p => ({ ...p, epochs: ep }));
                    simulator.updateHyperparameters({ epochs: ep });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                >
                  <option value={10}>10</option>
                  <option value={25}>25 (Quick)</option>
                  <option value={50}>50</option>
                  <option value={100}>100 (Full Script)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Learning Rate (LEARNING_RATE)</label>
                <input
                  type="number"
                  step="0.00001"
                  disabled={isRunning}
                  value={params.learningRate}
                  onChange={(e) => {
                    const lr = Number(e.target.value);
                    setParams(p => ({ ...p, learningRate: lr }));
                    simulator.updateHyperparameters({ learningRate: lr });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Scheduler Patience</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  disabled={isRunning}
                  value={params.schedulerPatience}
                  onChange={(e) => {
                    const pat = Number(e.target.value);
                    setParams(p => ({ ...p, schedulerPatience: pat }));
                    simulator.updateHyperparameters({ schedulerPatience: pat });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Simulation Speed:</span>
              <div className="flex space-x-1.5">
                {[
                  { label: 'Normal', ms: 750 },
                  { label: 'Fast', ms: 350 },
                  { label: 'Hyper', ms: 120 }
                ].map((s) => (
                  <button
                    key={s.ms}
                    onClick={() => setSpeedMs(s.ms)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      speedMs === s.ms ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Terminal Console Output */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-2xl flex flex-col h-[380px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-slate-300 font-medium">
                  PyTorch Training Console (stdout)
                </span>
              </div>
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
              </div>
            </div>

            {/* Scrollable log area */}
            <div className="flex-1 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1 pr-2">
              {logs.map((log, idx) => {
                const isImprovement = log.includes('Validation loss improved');
                const isReduceLr = log.includes('ReduceLROnPlateau');
                const isDivider = log.includes('-----');
                const isEpochHeader = log.includes('Epoch [');

                return (
                  <div
                    key={idx}
                    className={`leading-relaxed ${
                      isImprovement
                        ? 'text-emerald-400 font-semibold'
                        : isReduceLr
                        ? 'text-amber-400 font-semibold'
                        : isEpochHeader
                        ? 'text-indigo-300'
                        : isDivider
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {log}
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
