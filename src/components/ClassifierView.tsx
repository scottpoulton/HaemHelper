import React, { useState } from 'react';
import {
  Microscope,
  CheckCircle2,
  Layers,
  Info,
  RefreshCw,
  ZoomIn,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { HAEMATOLOGY_CLASSES, SAMPLE_SLIDES } from '../data/bloodCellsData';
import { runResNet18Inference } from '../utils/resnet18Model';
import { runRealOnnxInference } from '../utils/onnxInference';
import { BloodSmearSample, InferenceResult, CellClass, ModelPrediction } from '../types';

interface ClassifierViewProps {
  device: string;
  onAddToDifferential: (cellClassId: string) => void;
}

export const ClassifierView: React.FC<ClassifierViewProps> = ({ device, onAddToDifferential }) => {
  const [selectedSample, setSelectedSample] = useState<BloodSmearSample>(SAMPLE_SLIDES[0]);
  const [activeCellClass, setActiveCellClass] = useState<CellClass>(
    HAEMATOLOGY_CLASSES.find(c => c.id === SAMPLE_SLIDES[0].cellClassId) || HAEMATOLOGY_CLASSES[0]
  );
  const [inferenceResult, setInferenceResult] = useState<InferenceResult>(() =>
    runResNet18Inference(SAMPLE_SLIDES[0].cellClassId, device)
  );
  const [inferenceMode, setInferenceMode] = useState<'onnx_wasm' | 'simulated_fallback'>('simulated_fallback');
  const [onnxStatusNote, setOnnxStatusNote] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const runOnnxOrFallback = async (imgElement: HTMLImageElement | null, fallbackClassId: string) => {
    setIsProcessing(true);

    if (imgElement) {
      try {
        const { rawLogits, probabilities } = await runRealOnnxInference(imgElement);

        const allPredictions: ModelPrediction[] = HAEMATOLOGY_CLASSES.map((c, idx) => ({
          classId: c.id,
          className: c.name,
          category: c.category,
          logit: Number((rawLogits[idx] ?? 0).toFixed(3)),
          probability: probabilities[idx] ?? 0,
        })).sort((a, b) => b.probability - a.probability);

        const topPred = allPredictions[0];
        const matchedClass = HAEMATOLOGY_CLASSES.find(c => c.id === topPred.classId) || HAEMATOLOGY_CLASSES[0];

        setActiveCellClass(matchedClass);
        setInferenceMode('onnx_wasm');
        setOnnxStatusNote(null);
        setInferenceResult({
          topPrediction: topPred,
          allPredictions,
          tensorShape: [1, 3, 224, 224],
          featureVectorPreview: rawLogits.slice(0, 8).map(v => Number(v.toFixed(3))),
          rawLogits,
          computationDevice: 'ONNX-WASM',
          timestamp: new Date().toLocaleTimeString(),
        });
        setIsProcessing(false);
        return;
      } catch {
        setInferenceMode('simulated_fallback');
        setOnnxStatusNote(
          'ONNX model (/models/haem_resnet18.onnx) not found in public/models/. Using reference simulation fallback. Run `python python/export_onnx.py` to enable live browser ONNX inference.'
        );
      }
    } else {
      setInferenceMode('simulated_fallback');
    }

    setTimeout(() => {
      const res = runResNet18Inference(fallbackClassId, 'SIMULATED');
      setInferenceResult(res);
      setIsProcessing(false);
    }, 200);
  };

  const handleSelectSample = (sample: BloodSmearSample) => {
    setSelectedSample(sample);
    setCustomImage(null);
    setOnnxStatusNote(null);
    const matched = HAEMATOLOGY_CLASSES.find(c => c.id === sample.cellClassId) || HAEMATOLOGY_CLASSES[0];
    setActiveCellClass(matched);
    runOnnxOrFallback(null, matched.id);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomImageName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomImage(dataUrl);

      const img = new Image();
      img.onload = () => {
        runOnnxOrFallback(img, activeCellClass.id);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Microscope className="w-4 h-4" />
            <span>Single-Cell Morphology & Classification</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Peripheral Blood Smear Classifier
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Evaluates 224×224 Wright-Giemsa cell crops through the 8-class ResNet-18 head via ONNX Runtime Web (or reference simulation when weights are not yet exported).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => runOnnxOrFallback(null, activeCellClass.id)}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Running...' : 'Re-evaluate Sample'}</span>
          </button>
        </div>
      </div>

      {/* ONNX Fallback Notice Banner */}
      {onnxStatusNote && (
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-start space-x-2.5 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="font-mono text-[11px] leading-relaxed">{onnxStatusNote}</div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Slide View & Specimen Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Reference Specimens:
              </span>
              <label className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer font-semibold flex items-center space-x-1">
                <span>Upload Cell Crop (ONNX Test)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {SAMPLE_SLIDES.map((s) => {
                const isSelected = selectedSample.id === s.id && !customImage;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSample(s)}
                    className={`text-left p-2.5 rounded-lg border transition-colors text-xs cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="font-semibold truncate text-slate-200">{s.name.split(':')[0]}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{s.groundTruthLabel}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Microscope Viewport */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-mono text-slate-300">
                  {customImage ? customImageName : selectedSample.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {selectedSample.magnification}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
                <ZoomIn className="w-3.5 h-3.5" />
                <button
                  onClick={() => setZoomLevel(Math.max(80, zoomLevel - 20))}
                  className="hover:text-white px-1 font-mono font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-slate-200">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(180, zoomLevel + 20))}
                  className="hover:text-white px-1 font-mono font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="relative w-full aspect-square max-w-[400px] mx-auto rounded-full border-4 border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 pointer-events-none z-10 opacity-20">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-rose-400"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-rose-400"></div>
                <div className="absolute inset-8 rounded-full border border-dashed border-rose-400"></div>
              </div>

              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transition: 'transform 0.15s ease-out' }}
                className="w-full h-full flex items-center justify-center p-4"
              >
                {customImage ? (
                  <img
                    src={customImage}
                    alt="Uploaded Smear"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <div
                    dangerouslySetInnerHTML={{ __html: activeCellClass.svgRender(320) }}
                    className="w-full h-full flex items-center justify-center"
                  />
                )}
              </div>

              <div className="absolute bottom-4 right-8 bg-slate-950/90 border border-slate-800 rounded px-2 py-0.5 text-[10px] font-mono text-slate-400 z-20">
                100x Oil • NA 1.25
              </div>
            </div>

            <div className="mt-5 p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-300">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-200">Clinical Context:</span>
                <span className="text-slate-400">{selectedSample.patientContext}</span>
              </div>
              {selectedSample.abnormalFeatureNote && (
                <div className="text-amber-400 pl-5 text-[11px]">
                  <strong>Morphology Note:</strong> {selectedSample.abnormalFeatureNote}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Predictions & Reference Criteria (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Classification Output
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                  inferenceMode === 'onnx_wasm'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {inferenceMode === 'onnx_wasm' ? 'ONNX Runtime (WASM)' : 'Reference Simulation'}
              </span>
            </div>

            <div className="mt-4 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {inferenceResult.topPrediction.className}
                </h3>
                <div className="text-xs text-slate-400 font-mono italic mt-0.5">
                  {activeCellClass.scientificName}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Lineage: <span className="text-slate-200 font-medium">{inferenceResult.topPrediction.category}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold font-mono text-emerald-400">
                  {(inferenceResult.topPrediction.probability * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">
                  Softmax Prob
                </div>
              </div>
            </div>

            {/* Softmax Bar Chart */}
            <div className="mt-6 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Class Probability Distribution</span>
                <span className="font-mono text-[11px]">Logit</span>
              </div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {inferenceResult.allPredictions.map((pred) => {
                  const pct = Math.round(pred.probability * 100);
                  const isTop = pred.classId === inferenceResult.topPrediction.classId;
                  return (
                    <div key={pred.classId}>
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className={`truncate ${isTop ? 'font-bold text-white' : 'text-slate-400'}`}>
                          {pred.className}
                        </span>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="font-mono text-[10px] text-slate-500">
                            {pred.logit > 0 ? `+${pred.logit}` : pred.logit}
                          </span>
                          <span className={`font-mono text-[11px] ${isTop ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(pct, 2)}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            isTop ? 'bg-emerald-500' : 'bg-slate-600'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Inspect in full 100-cell differential:
              </span>
              <button
                onClick={() => onAddToDifferential(inferenceResult.topPrediction.classId)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                Open Differential Workstation →
              </button>
            </div>
          </div>

          {/* Morphological Criteria Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 text-xs space-y-3">
            <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-400" />
              Morphology & Reference Criteria
            </h4>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">Wright-Giemsa Staining:</span>
                <p className="text-slate-300 mt-1">
                  <strong>Cytoplasm:</strong> {activeCellClass.stainAppearance.cytoplasm}
                </p>
                <p className="text-slate-300 mt-0.5">
                  <strong>Nucleus:</strong> {activeCellClass.stainAppearance.nucleus}
                </p>
                {activeCellClass.stainAppearance.granules && (
                  <p className="text-slate-300 mt-0.5">
                    <strong>Granules:</strong> {activeCellClass.stainAppearance.granules}
                  </p>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">Adult Reference Range:</span>
                <p className="text-emerald-400 font-mono mt-0.5">
                  {activeCellClass.referencePercentage}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">Clinical Associations:</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">
                  {activeCellClass.clinicalSignificance}
                </p>
              </div>
            </div>
          </div>

          {/* Logit / Feature Preview */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Linear Head Activations
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                nn.Linear(512, {HAEMATOLOGY_CLASSES.length})
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 font-mono text-[10px]">
              {inferenceResult.featureVectorPreview.slice(0, 8).map((val, idx) => (
                <div
                  key={idx}
                  className={`p-1 text-center rounded border ${
                    val > 0
                      ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800/40 text-rose-300'
                  }`}
                >
                  {val > 0 ? `+${val}` : val}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};