import React, { useState } from 'react';
import { SlidersHorizontal, Shuffle, Layers, Info, Check, Eye } from 'lucide-react';
import { HAEMATOLOGY_CLASSES } from '../data/bloodCellsData';
import { DEFAULT_AUGMENTATIONS, getColorJitterCss } from '../utils/haematologyLoader';
import { AugmentationSettings } from '../types';

export const AugmentationsView: React.FC = () => {
  const [selectedCellId, setSelectedCellId] = useState<string>(HAEMATOLOGY_CLASSES[0].id);
  const [settings, setSettings] = useState<AugmentationSettings>(DEFAULT_AUGMENTATIONS);
  const [pipelineMode, setPipelineMode] = useState<'train' | 'val'>('train');

  const activeCell = HAEMATOLOGY_CLASSES.find(c => c.id === selectedCellId) || HAEMATOLOGY_CLASSES[0];

  const handleRandomizeAugmentations = () => {
    const rotations = [0, 90, 180, 270];
    setSettings({
      ...settings,
      horizontalFlip: Math.random() > 0.5,
      verticalFlip: Math.random() > 0.5,
      rotationDegrees: rotations[Math.floor(Math.random() * rotations.length)],
      brightnessJitter: Number(((Math.random() - 0.5) * 0.2).toFixed(2)),
      contrastJitter: Number(((Math.random() - 0.5) * 0.2).toFixed(2)),
    });
  };

  const handleResetAugmentations = () => {
    setSettings(DEFAULT_AUGMENTATIONS);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs uppercase tracking-wider mb-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span>torchvision.transforms Pipeline</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Morphological Augmentation & Normalization
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Simulates <code className="text-rose-300">haematology_loader.py</code>. Augments slides with 90° rotations, flips, and color jitter to model laboratory staining variations and orientation isotropy.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Train vs Validation Pipeline Switch */}
          <div className="bg-slate-800 p-1 rounded-xl flex space-x-1 border border-slate-700">
            <button
              onClick={() => setPipelineMode('train')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pipelineMode === 'train'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Train Pipeline (80%)
            </button>
            <button
              onClick={() => setPipelineMode('val')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pipelineMode === 'val'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Val Pipeline (20%)
            </button>
          </div>
        </div>
      </div>

      {/* Specimen Selector */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs text-slate-400 uppercase font-semibold shrink-0 mr-2">
          Cell Type:
        </span>
        {HAEMATOLOGY_CLASSES.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCellId(c.id)}
            className={`px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all ${
              selectedCellId === c.id
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Side-by-Side Comparison (Raw vs Augmented) (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                Raw Slide Patch vs. PyTorch Transformed Tensor
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleRandomizeAugmentations}
                  disabled={pipelineMode === 'val'}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-slate-200 border border-slate-700 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Random Batch Draw</span>
                </button>
                <button
                  onClick={handleResetAugmentations}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 border border-slate-700"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Raw Input */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col items-center">
                <div className="text-xs font-mono text-slate-400 mb-2 flex items-center justify-between w-full">
                  <span>Raw ImageFolder Input</span>
                  <span className="text-[10px] text-slate-500">224 x 224 px</span>
                </div>
                <div className="w-48 h-48 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center shadow-inner">
                  <div
                    dangerouslySetInnerHTML={{ __html: activeCell.svgRender(180) }}
                    className="w-full h-full flex items-center justify-center"
                  />
                </div>
                <div className="mt-3 text-[11px] text-slate-400 text-center">
                  Original slide crop at standard staining and orientation
                </div>
              </div>

              {/* Augmented Output */}
              <div className="bg-slate-950 rounded-xl border border-rose-900/40 p-4 flex flex-col items-center relative">
                <div className="text-xs font-mono text-rose-300 mb-2 flex items-center justify-between w-full">
                  <span>Transformed Tensor</span>
                  <span className="text-[10px] font-mono text-indigo-400">
                    [3, 224, 224]
                  </span>
                </div>
                <div
                  className="w-48 h-48 rounded-lg overflow-hidden border border-rose-500/30 bg-slate-900 flex items-center justify-center shadow-inner relative transition-all duration-300"
                  style={{
                    transform: pipelineMode === 'train' ? `
                      rotate(${settings.rotationDegrees}deg)
                      scaleX(${settings.horizontalFlip ? -1 : 1})
                      scaleY(${settings.verticalFlip ? -1 : 1})
                    ` : 'none',
                    filter: pipelineMode === 'train' ? getColorJitterCss(settings.brightnessJitter, settings.contrastJitter) : 'none',
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: activeCell.svgRender(180) }}
                    className="w-full h-full flex items-center justify-center"
                  />
                  {/* Normalization overlay visualization */}
                  {settings.applyNormalization && (
                    <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none mix-blend-color"></div>
                  )}
                </div>

                <div className="mt-3 text-[11px] text-slate-300 text-center font-mono">
                  {pipelineMode === 'train' ? (
                    <span>
                      Rot: {settings.rotationDegrees}° | HFlip: {settings.horizontalFlip ? 'Yes' : 'No'} | VFlip: {settings.verticalFlip ? 'Yes' : 'No'}
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      Validation Pipeline: deterministic resize & normalise only
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Explanation box */}
            <div className="mt-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-rose-300 font-semibold">
                <Info className="w-4 h-4 shrink-0" />
                <span>Why Morphological Augmentation is Critical in Haematology:</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                White blood cells are isotropic in peripheral blood smears: a neutrophil rotated 90° or flipped vertically is biologically identical to the original cell. However, hospital laboratories utilize differing automated slide stainers (Wright, Giemsa, Leishman) and batch reagent ages. <strong>ColorJitter(brightness=0.1, contrast=0.1)</strong> forces ResNet-18 to learn robust morphological features (chromatin clumps, lobulation, granules) rather than memorizing slight institutional tint differences.
              </p>
            </div>
          </div>

          {/* Mini-batch 4-slide Preview */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 font-semibold">
              Simulated Mini-Batch Samples (DataLoader Output: batch_size=4)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { rot: 90, hf: true, vf: false, b: 0.08, c: -0.05 },
                { rot: 180, hf: false, vf: true, b: -0.06, c: 0.1 },
                { rot: 270, hf: true, vf: true, b: 0.04, c: 0.07 },
                { rot: 0, hf: false, vf: false, b: -0.09, c: -0.08 },
              ].map((batchItem, i) => (
                <div key={i} className="bg-slate-950 rounded-xl border border-slate-800 p-2.5 text-center">
                  <div
                    className="w-24 h-24 mx-auto rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center bg-slate-900"
                    style={{
                      transform: `rotate(${batchItem.rot}deg) scaleX(${batchItem.hf ? -1 : 1}) scaleY(${batchItem.vf ? -1 : 1})`,
                      filter: getColorJitterCss(batchItem.b, batchItem.c),
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: activeCell.svgRender(85) }} />
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-slate-400">
                    Batch item #{i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mathematical Filters Breakdown & Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-white">
              Mathematical Filters in Pipeline
            </h3>

            {/* Filter 1: Resize */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="flex items-center justify-between font-mono text-slate-200">
                <span className="text-indigo-400">1. transforms.Resize((224, 224))</span>
                <span className="text-[11px] text-emerald-400">Active</span>
              </div>
              <p className="text-slate-400 mt-1 text-[11px]">
                Standardizes irregular microscope camera sensors to the ResNet-18 native input dimension.
              </p>
            </div>

            {/* Filter 2: Flips */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between font-mono text-slate-200">
                <span className="text-indigo-400">2. Random Flips</span>
                <span className="text-[11px] text-emerald-400">{pipelineMode === 'train' ? 'p=0.5' : 'Disabled (val)'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.horizontalFlip}
                    onChange={(e) => setSettings({ ...settings, horizontalFlip: e.target.checked })}
                    className="rounded border-slate-700 text-rose-500 focus:ring-0"
                  />
                  <span>Horizontal Flip</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.verticalFlip}
                    onChange={(e) => setSettings({ ...settings, verticalFlip: e.target.checked })}
                    className="rounded border-slate-700 text-rose-500 focus:ring-0"
                  />
                  <span>Vertical Flip</span>
                </label>
              </div>
            </div>

            {/* Filter 3: Rotation */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between font-mono text-slate-200">
                <span className="text-indigo-400">3. RandomRotation(90)</span>
                <span className="font-mono text-rose-400">{settings.rotationDegrees}°</span>
              </div>
              <div className="flex space-x-1.5">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setSettings({ ...settings, rotationDegrees: deg })}
                    className={`flex-1 py-1 rounded text-xs font-mono ${
                      settings.rotationDegrees === deg
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 4: Color Jitter */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-3">
              <div className="flex items-center justify-between font-mono text-slate-200">
                <span className="text-indigo-400">4. ColorJitter(0.1, 0.1)</span>
                <span className="text-[11px] text-slate-400">Stain variance</span>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Brightness Jitter:</span>
                  <span className="font-mono text-slate-200">{settings.brightnessJitter > 0 ? `+${settings.brightnessJitter}` : settings.brightnessJitter}</span>
                </div>
                <input
                  type="range"
                  min="-0.2"
                  max="0.2"
                  step="0.02"
                  value={settings.brightnessJitter}
                  onChange={(e) => setSettings({ ...settings, brightnessJitter: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Contrast Jitter:</span>
                  <span className="font-mono text-slate-200">{settings.contrastJitter > 0 ? `+${settings.contrastJitter}` : settings.contrastJitter}</span>
                </div>
                <input
                  type="range"
                  min="-0.2"
                  max="0.2"
                  step="0.02"
                  value={settings.contrastJitter}
                  onChange={(e) => setSettings({ ...settings, contrastJitter: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>

            {/* Filter 5: Normalization */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between font-mono text-slate-200">
                <span className="text-indigo-400">5. transforms.Normalize()</span>
                <span className="text-emerald-400 font-mono text-[10px]">ImageNet</span>
              </div>
              <div className="font-mono text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                mean=[0.485, 0.456, 0.406]<br />
                std=[0.229, 0.224, 0.225]
              </div>
              <p className="text-slate-400 text-[11px]">
                Scales pixel intensities to match the distributions expected by torchvision pre-trained models.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
