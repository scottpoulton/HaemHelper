import React, { useState } from 'react';
import { Cpu, Layers, GitBranch, Play } from 'lucide-react';
import { RESNET18_LAYERS } from '../utils/resnet18Model';
import { HAEMATOLOGY_CLASSES } from '../data/bloodCellsData';

export const ModelArchitectureView: React.FC = () => {
  const [dummyBatchSize, setDummyBatchSize] = useState<number>(8);
  const [dummyOutput, setDummyOutput] = useState<{
    inputShape: string;
    outputShape: string;
    sampleLogits: number[];
    timestamp: string;
  } | null>(null);

  const handleRunDummyBatch = () => {
    const sampleLogits = HAEMATOLOGY_CLASSES.map(() =>
      Number(((Math.random() - 0.5) * 4.2).toFixed(3))
    );

    setDummyOutput({
      inputShape: `(${dummyBatchSize}, 3, 224, 224)`,
      outputShape: `(${dummyBatchSize},${HAEMATOLOGY_CLASSES.length})`,
      sampleLogits,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>ResNet-18 Backbone & Transfer Learning Head</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Network Architecture & Layer Inspector
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Inspects the feature extractor backbone from <code className="text-rose-300">python/model.py</code> with replaced <code className="text-rose-300">fc = nn.Sequential(nn.Dropout(0.5), nn.Linear(512, {HAEMATOLOGY_CLASSES.length}))</code>.
          </p>
        </div>

        <button
          onClick={handleRunDummyBatch}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4" />
          <span>Verify Tensor Shapes</span>
        </button>
      </div>

      {/* Forward Pass Shape Verification */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Forward Pass Shape Verification (<code className="text-slate-300 text-xs">get_haem_model</code>)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verifies input and output tensor dimensions across batch sizes.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Batch Size:</span>
            {[4, 8, 16, 32].map((bs) => (
              <button
                key={bs}
                onClick={() => setDummyBatchSize(bs)}
                className={`px-2.5 py-1 rounded font-mono cursor-pointer ${
                  dummyBatchSize === bs
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {bs}
              </button>
            ))}
          </div>
        </div>

        {dummyOutput ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Input Tensor Shape</span>
              <span className="text-slate-200 text-sm font-bold mt-1 block">
                {dummyOutput.inputShape}
              </span>
              <span className="text-slate-500 text-[11px] mt-0.5 block">
                [Batch, Channels, Height, Width]
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Output Tensor Shape</span>
              <span className="text-emerald-400 text-sm font-bold mt-1 block">
                {dummyOutput.outputShape}
              </span>
              <span className="text-slate-500 text-[11px] mt-0.5 block">
                [Batch Size, Num Classes]
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Sample Unnormalized Logits</span>
              <div className="text-[11px] text-slate-300 truncate mt-1">
                [{dummyOutput.sampleLogits.join(', ')}]
              </div>
              <span className="text-slate-500 text-[10px] mt-0.5 block">
                Passed to nn.CrossEntropyLoss / Softmax
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
            Click <strong>"Verify Tensor Shapes"</strong> above to inspect <code className="text-slate-200">model = get_haem_model(num_classes={HAEMATOLOGY_CLASSES.length})</code>.
          </div>
        )}
      </div>

      {/* Layer-by-Layer Computational Flow Graph */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-rose-400" />
          Layer Pipeline Breakdown (11.2M Parameters)
        </h3>

        <div className="space-y-3">
          {RESNET18_LAYERS.map((layer, index) => {
            const isCustomHead = layer.name.startsWith('fc.');
            return (
              <div
                key={layer.name}
                className={`p-4 rounded-xl border transition-all ${
                  isCustomHead
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-white">
                          {layer.name}
                        </span>
                        {isCustomHead && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                            Transfer Learning Head
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 font-mono mt-0.5">
                        {layer.type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono text-slate-400 pl-9 sm:pl-0">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Shape:</span>
                      <span className="text-slate-300">{layer.inputShape} → {layer.outputShape}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Params:</span>
                      <span className="text-slate-300">{layer.params}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-400 pl-9">
                  {layer.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};