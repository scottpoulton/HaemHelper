import React, { useState } from 'react';
import { Microscope, Sparkles, CheckCircle2, AlertTriangle, Layers, Info, RefreshCw, ZoomIn, Eye, Activity, Cpu } from 'lucide-react';
import { HAEMATOLOGY_CLASSES, SAMPLE_SLIDES } from '../data/bloodCellsData';
import { runResNet18Inference } from '../utils/resnet18Model';
import { BloodSmearSample, InferenceResult, CellClass } from '../types';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleSelectSample = (sample: BloodSmearSample) => {
    setSelectedSample(sample);
    setCustomImage(null);
    const matched = HAEMATOLOGY_CLASSES.find(c => c.id === sample.cellClassId) || HAEMATOLOGY_CLASSES[0];
    setActiveCellClass(matched);
    executeInference(matched.id);
  };

  const executeInference = (cellId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = runResNet18Inference(cellId, device);
      setInferenceResult(res);
      setIsProcessing(false);
    }, 250);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomImageName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
        // Randomly assign one of the classes for interactive evaluation
        const randomClass = HAEMATOLOGY_CLASSES[Math.floor(Math.random() * HAEMATOLOGY_CLASSES.length)];
        setActiveCellClass(randomClass);
        executeInference(randomClass.id);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Microscope className="w-4 h-4" />
            <span>High-Power Field (100x Oil Immersion) Inference</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Peripheral Blood Smear Classifier
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Passes digitized Wright-Giemsa blood smear micrographs through the fine-tuned ResNet-18 backbone, outputting feature vectors, class logits, and softmax probabilities.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => executeInference(activeCellClass.id)}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-rose-950/50 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Classifying...' : 'Re-run ResNet18'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Microscope Slide vs Classification Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Slide View & Specimen Select (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Specimen Presets Carousel */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Slide Specimen:
              </span>
              <label className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer font-medium flex items-center space-x-1">
                <span>Upload Smear Image</span>
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
                    className={`text-left p-2.5 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500/50 text-white shadow-sm ring-1 ring-rose-500/40'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold truncate text-slate-200">{s.name.split(':')[0]}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{s.groundTruthLabel}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Virtual Microscope Field */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-mono text-slate-300">
                  {customImage ? customImageName : selectedSample.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {selectedSample.magnification}
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg">
                <ZoomIn className="w-3.5 h-3.5" />
                <button
                  onClick={() => setZoomLevel(Math.max(80, zoomLevel - 20))}
                  className="hover:text-white px-1 font-mono font-bold"
                >
                  -
                </button>
                <span className="font-mono text-slate-200">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(180, zoomLevel + 20))}
                  className="hover:text-white px-1 font-mono font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Microscope Circular Field Overlay */}
            <div className="relative w-full aspect-square max-w-[420px] mx-auto rounded-full border-4 border-slate-800/80 shadow-inner bg-slate-950 overflow-hidden flex items-center justify-center group">
              {/* Microscope reticle crosshairs */}
              <div className="absolute inset-0 pointer-events-none z-10 opacity-20">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-rose-400"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-rose-400"></div>
                <div className="absolute inset-8 rounded-full border border-dashed border-rose-400"></div>
              </div>

              {/* Image / SVG Content with Zoom */}
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transition: 'transform 0.2s ease-out' }}
                className="w-full h-full flex items-center justify-center p-4"
              >
                {customImage ? (
                  <img
                    src={customImage}
                    alt="Uploaded Smear"
                    className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <div
                    dangerouslySetInnerHTML={{ __html: activeCellClass.svgRender(320) }}
                    className="w-full h-full flex items-center justify-center"
                  />
                )}
              </div>

              {/* Magnification watermark */}
              <div className="absolute bottom-4 right-8 bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded px-2 py-0.5 text-[10px] font-mono text-slate-400 z-20">
                100x Oil Immersion • NA 1.25
              </div>
            </div>

            {/* Slide Clinical Details */}
            <div className="mt-5 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70 text-xs space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-300">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-medium text-slate-200">Patient Presentation:</span>
                <span className="text-slate-400">{selectedSample.patientContext}</span>
              </div>
              {selectedSample.abnormalFeatureNote && (
                <div className="text-amber-400/90 pl-5 text-[11px]">
                  <strong>Morphology alert:</strong> {selectedSample.abnormalFeatureNote}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: ResNet18 Outputs, Softmax, Feature Vector, Differential (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Top Classification Card */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
                ResNet18 Model Prediction
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Device: {inferenceResult.computationDevice}
              </span>
            </div>

            {/* Dominant Prediction */}
            <div className="mt-4 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-extrabold text-white tracking-tight">
                  {inferenceResult.topPrediction.className}
                </h3>
                <div className="text-xs text-rose-300/80 font-mono italic mt-0.5">
                  {activeCellClass.scientificName}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Category: <span className="text-slate-200 font-medium">{inferenceResult.topPrediction.category}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold font-mono text-emerald-400">
                  {(inferenceResult.topPrediction.probability * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">
                  Softmax Conf.
                </div>
              </div>
            </div>

            {/* Softmax Probability Distribution Bar Chart */}
            <div className="mt-6 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Multi-Class Softmax Distribution:</span>
                <span className="font-mono text-[11px]">Raw Logit</span>
              </div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {inferenceResult.allPredictions.map((pred) => {
                  const pct = Math.round(pred.probability * 100);
                  const isTop = pred.classId === inferenceResult.topPrediction.classId;
                  return (
                    <div key={pred.classId} className="group">
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
                            isTop ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-slate-600'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add to 100-cell differential tally button */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Log into laboratory differential:
              </span>
              <button
                onClick={() => onAddToDifferential(inferenceResult.topPrediction.classId)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 hover:border-slate-600 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <span>+ Tally Cell in Diff</span>
              </button>
            </div>
          </div>

          {/* Morphological Criteria Card */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl text-xs space-y-3">
            <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              Morphology & Diagnostic Criteria
            </h4>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 font-medium">Staining Profile:</span>
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

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 font-medium">Reference Normal Range:</span>
                <p className="text-emerald-400 font-mono mt-0.5">
                  {activeCellClass.referencePercentage}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30">
                <span className="text-rose-300 font-medium">Clinical Significance:</span>
                <p className="text-slate-300 mt-0.5">
                  {activeCellClass.clinicalSignificance}
                </p>
              </div>
            </div>
          </div>

          {/* ResNet-18 Feature Bottleneck Preview */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                AdaptiveAvgPool2d Bottleneck (512-dim slice)
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Shape: [1, 512]
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mb-2">
              Extracted feature activations fed into <code className="text-indigo-300">nn.Dropout(p=0.5)</code> and final <code className="text-indigo-300">nn.Linear(512, {HAEMATOLOGY_CLASSES.length})</code>:
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 font-mono text-[10px]">
              {inferenceResult.featureVectorPreview.map((val, idx) => (
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
