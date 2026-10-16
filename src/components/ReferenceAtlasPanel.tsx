import React, { useState } from 'react';
import { CellaVisionClassId } from '../types';
import { CELLAVISION_CLASSES } from '../data/cellDefinitions';
import { REFERENCE_ATLAS } from '../data/referenceAtlas';
import { BookOpen, X, Search, Sparkles, Filter, ExternalLink, ChevronRight, Check } from 'lucide-react';

interface ReferenceAtlasPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCellClassId?: CellaVisionClassId;
  onSelectCompareClass: (classId: CellaVisionClassId) => void;
  onQuickReclassifySelected?: (classId: CellaVisionClassId) => void;
}

export const ReferenceAtlasPanel: React.FC<ReferenceAtlasPanelProps> = ({
  isOpen,
  onClose,
  selectedCellClassId,
  onSelectCompareClass,
  onQuickReclassifySelected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<CellaVisionClassId | null>(null);

  if (!isOpen) return null;

  const classKeys = Object.keys(CELLAVISION_CLASSES) as CellaVisionClassId[];

  const filteredKeys = classKeys.filter(id => {
    const def = CELLAVISION_CLASSES[id];
    const matchesSearch = 
      def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.shortLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      REFERENCE_ATLAS[id]?.diagnosticHallmarks.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'granulocyte') return def.category === 'Granulocyte';
    if (categoryFilter === 'agranulocyte') return def.category === 'Agranulocyte';
    if (categoryFilter === 'blast') return def.category === 'Blast / Precursor';
    return true;
  });

  return (
    <aside className="w-80 md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl z-30 transition-all">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight">
              Hematology Reference Atlas
            </h3>
            <p className="text-[11px] text-slate-400">
              Gold-standard morphology comparison
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-950/40">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search lineage, hallmarks (e.g. blast, band)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-1 text-[11px] overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'granulocyte', label: 'Granulocytes' },
            { id: 'agranulocyte', label: 'Agranulocytes' },
            { id: 'blast', label: 'Blasts / Precursors' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setCategoryFilter(f.id)}
              className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === f.id
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Atlas Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 pr-2">
        {filteredKeys.map(classId => {
          const def = CELLAVISION_CLASSES[classId];
          const ref = REFERENCE_ATLAS[classId] || REFERENCE_ATLAS.segmented_neutrophil;
          const isExpanded = expandedId === classId;
          const isCurrentSelected = selectedCellClassId === classId;
          const hasPhoto = Boolean(ref.realPhotoUrl);

          return (
            <div
              key={classId}
              className={`rounded-xl border transition-all ${
                isCurrentSelected
                  ? 'bg-indigo-950/20 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Card Header & Preview */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-3">
                    {/* Micrograph View: Photo or SVG */}
                    <div className="w-16 h-16 rounded-xl border border-slate-800 bg-slate-900 shrink-0 overflow-hidden flex items-center justify-center relative">
                      {ref.realPhotoUrl ? (
                        <>
                          <img
                            src={ref.realPhotoUrl}
                            alt={def.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/80 text-[8px] font-mono text-emerald-300 font-bold">
                            PHOTO
                          </span>
                        </>
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{ __html: def.svgRender(56) }}
                          className="w-full h-full flex items-center justify-center pointer-events-none"
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-xs tracking-tight">
                          {def.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-rose-300 font-mono font-semibold">
                          {def.shortLabel}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {ref.diameterUm} · {ref.nCRatio}
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Ref: {def.normalRange}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    <button
                      onClick={() => onSelectCompareClass(classId)}
                      className="px-2 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                      title="Compare side-by-side with selected patient cell"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span>Compare</span>
                    </button>

                    {onQuickReclassifySelected && (
                      <button
                        onClick={() => onQuickReclassifySelected(classId)}
                        className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                        title={`Reclassify selected cell to ${def.shortLabel} (${def.hotkey})`}
                      >
                        Reclass ({def.hotkey})
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Hallmarks */}
                <div className="mt-2 text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {def.stainDescription}
                </div>

                {/* Expand / Details Toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : classId)}
                  className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1 cursor-pointer"
                >
                  <span>{isExpanded ? 'Hide Morphology Details' : 'View Full Morphology & Pitfalls'}</span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Collapsible Deep Diagnostic Criteria */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 space-y-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-medium block">Chromatin:</span>
                    <p className="text-slate-300">{ref.chromatinPattern}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block">Cytoplasm & Granules:</span>
                    <p className="text-slate-300">{ref.cytoplasmicFeatures} — {ref.granularity}</p>
                  </div>

                  <div>
                    <span className="text-indigo-300 font-semibold block">Diagnostic Hallmarks:</span>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5 mt-0.5">
                      {ref.diagnosticHallmarks.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-900/30 text-amber-300">
                    <strong>Differential Pitfall:</strong> {ref.differentialPitfalls}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
