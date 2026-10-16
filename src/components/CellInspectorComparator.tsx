import React, { useState, useEffect } from 'react';
import { CellaVisionCellTile, CellaVisionClassId } from '../types';
import { CELLAVISION_CLASSES } from '../data/cellDefinitions';
import { REFERENCE_ATLAS, REAL_CELL_PHOTO_MAP } from '../data/referenceAtlas';
import { Check, Columns2, ArrowRight, ArrowLeft, ZoomIn, Info, AlertTriangle, ShieldCheck, Microscope, Camera, Layers } from 'lucide-react';

interface CellInspectorComparatorProps {
  cell: CellaVisionCellTile | null;
  onReclassify: (cellId: string, newClassId: CellaVisionClassId) => void;
  onVerify: (cellId: string) => void;
  onNavigateNext: () => void;
  onNavigatePrev: () => void;
}

export const CellInspectorComparator: React.FC<CellInspectorComparatorProps> = ({
  cell,
  onReclassify,
  onVerify,
  onNavigateNext,
  onNavigatePrev,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(140);
  const [viewMode, setViewMode] = useState<'photo' | 'svg'>('photo');
  const [showComparator, setShowComparator] = useState<boolean>(false);
  const [comparatorClassId, setComparatorClassId] = useState<CellaVisionClassId>('segmented_neutrophil');

  useEffect(() => {
    if (cell) {
      setComparatorClassId(cell.verifiedClassId);
    }
  }, [cell?.id]);

  // Keyboard shortcut listener for rapid reclassification
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (!cell) return;

      const key = e.key.toUpperCase();
      if (key === 'ARROWLEFT') {
        onNavigatePrev();
        return;
      }
      if (key === 'ARROWRIGHT' || key === 'ENTER' || key === ' ') {
        onVerify(cell.id);
        onNavigateNext();
        return;
      }

      // Check hotkeys
      const match = (Object.keys(CELLAVISION_CLASSES) as CellaVisionClassId[]).find(
        id => CELLAVISION_CLASSES[id].hotkey === key
      );
      if (match) {
        onReclassify(cell.id, match);
        onNavigateNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cell, onReclassify, onVerify, onNavigateNext, onNavigatePrev]);

  if (!cell) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <Microscope className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm">Select any cell tile from the gallery above to inspect and reclassify.</p>
      </div>
    );
  }

  const currentClass = CELLAVISION_CLASSES[cell.verifiedClassId] || CELLAVISION_CLASSES.unclassified;
  const originalAiClass = CELLAVISION_CLASSES[cell.aiPreClassId];
  const refEntry = REFERENCE_ATLAS[comparatorClassId] || REFERENCE_ATLAS.segmented_neutrophil;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="font-mono text-base font-bold text-white">
            Cell #{cell.tileIndex}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-rose-300 font-mono font-medium border border-slate-700">
            {currentClass.name} ({currentClass.shortLabel})
          </span>
          {cell.reclassified && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Reclassified from {originalAiClass.shortLabel}
            </span>
          )}
          {cell.isVerified && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Check className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        {/* Controls: Prev/Next, Verify, Comparator toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onNavigatePrev}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="Previous Cell (Left Arrow)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateNext}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="Next Cell (Right Arrow)"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onVerify(cell.id)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              cell.isVerified
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 border border-slate-700'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{cell.isVerified ? 'Verified' : 'Verify Cell (Space)'}</span>
          </button>

          <button
            onClick={() => setShowComparator(!showComparator)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              showComparator
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>{showComparator ? 'Hide Reference' : 'Reference Atlas'}</span>
          </button>
        </div>
      </div>

      {/* Main Inspection Stage: Patient Micrograph vs Optional Reference Atlas */}
      <div className={`grid gap-6 ${showComparator ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* Patient Cell Micrograph */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 flex flex-col items-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span className="flex items-center gap-1.5">
              <span>Patient Micrograph</span>
              {cell.customImageUrl && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                  Uploaded
                </span>
              )}
            </span>
            <span>Coord: ({cell.xCoord} µm, {cell.yCoord} µm)</span>
          </div>

          {/* Microscope Oil Immersion Reticle View */}
          <div className="relative w-64 h-64 rounded-full border-4 border-slate-800/80 bg-slate-900 shadow-inner flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20 z-10">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-rose-400"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-rose-400"></div>
              <div className="absolute inset-6 rounded-full border border-dashed border-rose-400"></div>
            </div>

            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transition: 'transform 0.15s ease-out' }}
              className="w-full h-full flex items-center justify-center p-2"
            >
              {viewMode === 'photo' || cell.customImageUrl ? (
                <img
                  src={cell.customImageUrl || REAL_CELL_PHOTO_MAP[cell.verifiedClassId]}
                  alt="Cell Micrograph"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentClass.svgRender(170, {
                      rot: cell.aspectVariants?.rotation,
                      bright: cell.aspectVariants?.brightness,
                      cont: cell.aspectVariants?.contrast,
                    }),
                  }}
                  className="w-full h-full flex items-center justify-center"
                />
              )}
            </div>

            <div className="absolute bottom-2 right-4 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 z-20">
              100x Oil • NA 1.25
            </div>
          </div>

          {/* Zoom & View Mode controls */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
              <button
                onClick={() => setViewMode('photo')}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'photo' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-3 h-3" />
                <span>Photo</span>
              </button>
              <button
                onClick={() => setViewMode('svg')}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'svg' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Vector</span>
              </button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center space-x-2">
              <ZoomIn className="w-3.5 h-3.5" />
              <button onClick={() => setZoomLevel(Math.max(100, zoomLevel - 20))} className="hover:text-white px-1 font-mono font-bold">-</button>
              <span className="font-mono text-slate-200">{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(Math.min(240, zoomLevel + 20))} className="hover:text-white px-1 font-mono font-bold">+</button>
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-400 text-center max-w-md">
            {currentClass.stainDescription}
          </div>
        </div>

        {/* Reference Atlas Comparator (if toggled) */}
        {showComparator && (
          <div className="bg-slate-950 rounded-2xl border border-indigo-900/40 p-5 flex flex-col relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Textbook Reference Atlas
              </span>

              {/* Selector for reference cell to compare against */}
              <select
                value={comparatorClassId}
                onChange={(e) => setComparatorClassId(e.target.value as CellaVisionClassId)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
              >
                {(Object.keys(CELLAVISION_CLASSES) as CellaVisionClassId[]).map(id => (
                  <option key={id} value={id}>
                    {CELLAVISION_CLASSES[id].name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-32 h-32 rounded-xl border border-indigo-500/30 bg-slate-900 shrink-0 flex items-center justify-center overflow-hidden relative">
                {refEntry.realPhotoUrl ? (
                  <>
                    <img
                      src={refEntry.realPhotoUrl}
                      alt={refEntry.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/85 text-[9px] font-mono text-emerald-300 font-bold">
                      100x PHOTO
                    </span>
                  </>
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: CELLAVISION_CLASSES[comparatorClassId].svgRender(110),
                    }}
                    className="w-full h-full flex items-center justify-center"
                  />
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-white text-sm">{refEntry.title}</h4>
                <div className="text-slate-400">
                  <strong>Diameter:</strong> {refEntry.diameterUm} · <strong>N:C Ratio:</strong> {refEntry.nCRatio}
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Chromatin:</strong> {refEntry.chromatinPattern}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="text-indigo-300 font-semibold text-[11px]">
                Diagnostic Hallmarks:
              </div>
              <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                {refEntry.diagnosticHallmarks.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>

              <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-900/30 text-[11px] text-amber-300">
                <strong>Differential Pitfall:</strong> {refEntry.differentialPitfalls}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CellaVision Rapid Reclassification Matrix & Hotkey Toolbar */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <span>Instant Reclassification (Click button or tap hotkey):</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Navigation: ← / → keys · Verify: Spacebar
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CELLAVISION_CLASSES) as CellaVisionClassId[]).map(classId => {
            const def = CELLAVISION_CLASSES[classId];
            const isCurrent = cell.verifiedClassId === classId;

            return (
              <button
                key={classId}
                onClick={() => {
                  onReclassify(cell.id, classId);
                  onNavigateNext();
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <span>{def.shortLabel}</span>
                <kbd className={`px-1 py-0.2 rounded text-[10px] font-bold ${
                  isCurrent ? 'bg-rose-700 text-white' : 'bg-slate-800 text-rose-300'
                }`}>
                  {def.hotkey}
                </kbd>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
