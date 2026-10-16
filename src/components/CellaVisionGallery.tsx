import React, { useState, useMemo } from 'react';
import { CellaVisionCellTile, CellaVisionClassId } from '../types';
import { CELLAVISION_CLASSES } from '../data/cellDefinitions';
import { REAL_CELL_PHOTO_MAP } from '../data/referenceAtlas';
import { 
  Check, 
  CheckCheck, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  AlertCircle, 
  ArrowUpDown, 
  Move, 
  GripVertical,
  CheckCircle2,
  Sparkles,
  Camera,
  Layers
} from 'lucide-react';

export type SortMode = 
  | 'tile_asc' 
  | 'tile_desc' 
  | 'confidence_desc' 
  | 'confidence_asc' 
  | 'unverified_first' 
  | 'reclassified_first' 
  | 'coord_x';

interface CellaVisionGalleryProps {
  cells: CellaVisionCellTile[];
  selectedCellId: string | null;
  onSelectCell: (cellId: string) => void;
  onVerifyGroup: (classId: CellaVisionClassId) => void;
  filterCategory: string;
  onFilterChange: (cat: string) => void;
  onReclassify: (cellId: string, newClassId: CellaVisionClassId) => void;
}

export const CellaVisionGallery: React.FC<CellaVisionGalleryProps> = ({
  cells,
  selectedCellId,
  onSelectCell,
  onVerifyGroup,
  filterCategory,
  onFilterChange,
  onReclassify,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [sortMode, setSortMode] = useState<SortMode>('tile_asc');
  const [displayMode, setDisplayMode] = useState<'real_photos' | 'schematic'>('real_photos');
  const [draggedCellId, setDraggedCellId] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<CellaVisionClassId | null>(null);
  const [reclassifyToast, setReclassifyToast] = useState<{
    message: string;
    targetClass: string;
  } | null>(null);

  const toggleGroup = (classId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [classId]: !prev[classId] }));
  };

  const showToast = (message: string, targetClass: string) => {
    setReclassifyToast({ message, targetClass });
    setTimeout(() => {
      setReclassifyToast(null);
    }, 3200);
  };

  // Group cells by their current verifiedClassId and sort them
  const groupedAndSortedCells = useMemo(() => {
    const grouped: Record<CellaVisionClassId, CellaVisionCellTile[]> = Object.keys(CELLAVISION_CLASSES).reduce(
      (acc, key) => {
        acc[key as CellaVisionClassId] = [];
        return acc;
      },
      {} as Record<CellaVisionClassId, CellaVisionCellTile[]>
    );

    cells.forEach(cell => {
      if (grouped[cell.verifiedClassId]) {
        grouped[cell.verifiedClassId].push(cell);
      } else {
        grouped.unclassified.push(cell);
      }
    });

    // Sort cells inside each group based on sortMode
    Object.keys(grouped).forEach(k => {
      const list = grouped[k as CellaVisionClassId];
      list.sort((a, b) => {
        if (sortMode === 'tile_asc') return a.tileIndex - b.tileIndex;
        if (sortMode === 'tile_desc') return b.tileIndex - a.tileIndex;
        if (sortMode === 'confidence_desc') return b.aiConfidence - a.aiConfidence;
        if (sortMode === 'confidence_asc') return a.aiConfidence - b.aiConfidence;
        if (sortMode === 'unverified_first') {
          if (a.isVerified === b.isVerified) return a.tileIndex - b.tileIndex;
          return a.isVerified ? 1 : -1;
        }
        if (sortMode === 'reclassified_first') {
          if (a.reclassified === b.reclassified) return a.tileIndex - b.tileIndex;
          return a.reclassified ? -1 : 1;
        }
        if (sortMode === 'coord_x') return a.xCoord - b.xCoord;
        return 0;
      });
    });

    return grouped;
  }, [cells, sortMode]);

  const totalCells = cells.length;

  // Filter groups
  const displayedClassKeys = (Object.keys(CELLAVISION_CLASSES) as CellaVisionClassId[]).filter(classId => {
    const list = groupedAndSortedCells[classId];
    if (filterCategory === 'all') return list.length > 0;
    if (filterCategory === 'unverified') return list.some(c => !c.isVerified);
    if (filterCategory === 'reclassified') return list.some(c => c.reclassified);
    if (filterCategory === 'granulocytes') return CELLAVISION_CLASSES[classId].category === 'Granulocyte' && list.length > 0;
    if (filterCategory === 'blasts') return (classId === 'blast' || classId === 'promyelocyte') && list.length > 0;
    return list.length > 0;
  });

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, cell: CellaVisionCellTile) => {
    e.dataTransfer.setData('text/plain', cell.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCellId(cell.id);
  };

  const handleDragEnd = () => {
    setDraggedCellId(null);
    setDragOverCategory(null);
  };

  const handleDragOverCategory = (e: React.DragEvent, classId: CellaVisionClassId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCategory !== classId) {
      setDragOverCategory(classId);
    }
  };

  const handleDragLeaveCategory = (e: React.DragEvent, classId: CellaVisionClassId) => {
    // Only clear if leaving to outside the container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverCategory === classId) {
      setDragOverCategory(null);
    }
  };

  const handleDropOnCategory = (e: React.DragEvent, targetClassId: CellaVisionClassId) => {
    e.preventDefault();
    const cellId = e.dataTransfer.getData('text/plain') || draggedCellId;
    if (!cellId) return;

    const sourceCell = cells.find(c => c.id === cellId);
    if (sourceCell) {
      const fromClass = CELLAVISION_CLASSES[sourceCell.verifiedClassId]?.name || 'Unknown';
      const toClass = CELLAVISION_CLASSES[targetClassId]?.name || 'Unknown';

      if (sourceCell.verifiedClassId !== targetClassId) {
        onReclassify(cellId, targetClassId);
        showToast(`Cell #${sourceCell.tileIndex} moved from ${fromClass} → ${toClass}`, toClass);
      }
    }

    setDraggedCellId(null);
    setDragOverCategory(null);
  };

  const currentlyDraggedCell = cells.find(c => c.id === draggedCellId);

  return (
    <div className="space-y-4 relative">
      {/* Reclassification Toast */}
      {reclassifyToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 shadow-2xl rounded-2xl p-4 flex items-center space-x-3 text-xs animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white tracking-tight">Manual Reclassification Saved</div>
            <div className="text-slate-300 font-mono text-[11px] mt-0.5">{reclassifyToast.message}</div>
          </div>
        </div>
      )}

      {/* Persistent Quick Drop Dock when Dragging */}
      {draggedCellId && (
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-2 border-dashed border-indigo-500/60 rounded-2xl shadow-2xl space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 font-mono text-indigo-300 font-bold">
              <Move className="w-4 h-4 animate-bounce text-rose-400" />
              <span>
                Dragging Cell #{currentlyDraggedCell?.tileIndex} — Drop into any target lineage below:
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Current: {currentlyDraggedCell ? CELLAVISION_CLASSES[currentlyDraggedCell.verifiedClassId].name : ''}
            </span>
          </div>

          {/* Quick Target Lineage Buttons (Universal Drop Zone) */}
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(CELLAVISION_CLASSES) as CellaVisionClassId[]).map(classId => {
              const def = CELLAVISION_CLASSES[classId];
              const isOver = dragOverCategory === classId;
              const isCurrent = currentlyDraggedCell?.verifiedClassId === classId;

              return (
                <div
                  key={classId}
                  onDragOver={(e) => handleDragOverCategory(e, classId)}
                  onDrop={(e) => handleDropOnCategory(e, classId)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                    isOver
                      ? 'bg-emerald-600 text-white scale-110 shadow-lg shadow-emerald-950/80 border-white ring-4 ring-emerald-400/40 z-20'
                      : isCurrent
                      ? 'bg-slate-800 text-slate-400 border-slate-700 opacity-60'
                      : 'bg-slate-950 text-slate-200 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <span>{def.shortLabel}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({def.hotkey})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls Bar: Filters & Sorting Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
        {/* Category Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
          {[
            { id: 'all', label: 'All Located Cells' },
            { id: 'unverified', label: 'Needs Verification' },
            { id: 'reclassified', label: 'Reclassified Only' },
            { id: 'granulocytes', label: 'Granulocytes' },
            { id: 'blasts', label: 'Blasts / Precursors' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-colors cursor-pointer ${
                filterCategory === f.id
                  ? 'bg-rose-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort Controls, Display Mode Switcher & Verification Stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Display Mode Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-xl p-0.5 text-xs font-mono">
            <button
              onClick={() => setDisplayMode('real_photos')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                displayMode === 'real_photos'
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Show authentic 100x oil immersion photomicrographs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Real Micrographs</span>
            </button>
            <button
              onClick={() => setDisplayMode('schematic')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                displayMode === 'schematic'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Show schematic vector cell diagrams"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Vector SVGs</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400 text-[11px] hidden sm:inline">Sort:</span>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="tile_asc" className="bg-slate-900">Tile # (1 → 100)</option>
              <option value="tile_desc" className="bg-slate-900">Tile # (100 → 1)</option>
              <option value="confidence_desc" className="bg-slate-900">AI Conf (High → Low)</option>
              <option value="confidence_asc" className="bg-slate-900">AI Conf (Low → High)</option>
              <option value="unverified_first" className="bg-slate-900">Unverified First</option>
              <option value="reclassified_first" className="bg-slate-900">Reclassified First</option>
              <option value="coord_x" className="bg-slate-900">Scan Line (X-Coord)</option>
            </select>
          </div>

          {/* Counts */}
          <div className="flex items-center space-x-2 font-mono text-slate-400 text-xs">
            <span>
              Verified: <strong className="text-emerald-400 font-bold">{cells.filter(c => c.isVerified).length}</strong> / {totalCells}
            </span>
            <span>·</span>
            <span>
              Reclassified: <strong className="text-amber-400 font-bold">{cells.filter(c => c.reclassified).length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Gallery Groups with Drag-and-Drop Drop Targets */}
      <div className="space-y-4 max-h-[720px] overflow-y-auto pr-1">
        {displayedClassKeys.map(classId => {
          const classDef = CELLAVISION_CLASSES[classId];
          const classCells = groupedAndSortedCells[classId];
          const isCollapsed = collapsedGroups[classId];
          const count = classCells.length;
          const percentage = totalCells > 0 ? ((count / totalCells) * 100).toFixed(1) : '0.0';
          const allVerified = count > 0 && classCells.every(c => c.isVerified);
          const isCritical = classId === 'blast' && count > 0;
          const isDragTarget = dragOverCategory === classId;

          return (
            <div
              key={classId}
              onDragOver={(e) => handleDragOverCategory(e, classId)}
              onDragLeave={(e) => handleDragLeaveCategory(e, classId)}
              onDrop={(e) => handleDropOnCategory(e, classId)}
              className={`rounded-2xl border transition-all duration-150 ${
                isDragTarget
                  ? 'border-2 border-emerald-400 bg-emerald-950/40 ring-4 ring-emerald-500/20 shadow-xl'
                  : isCritical
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              {/* Group Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-slate-800/80 gap-2">
                <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => toggleGroup(classId)}>
                  <button className="text-slate-500 hover:text-slate-300">
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">
                      {classDef.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-rose-300 font-semibold border border-slate-700">
                      {classDef.shortLabel}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      (Hotkey: {classDef.hotkey})
                    </span>
                    {isCritical && (
                      <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Critical Finding
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  {/* Drop Target Prompt when dragging */}
                  {isDragTarget ? (
                    <span className="text-emerald-400 font-bold font-mono text-xs animate-pulse">
                      ↓ Release to classify as {classDef.name}
                    </span>
                  ) : (
                    <>
                      <div className="font-mono text-slate-300">
                        <span className="text-white font-bold text-sm">{count}</span>
                        <span className="text-slate-500 text-xs ml-1">({percentage}%)</span>
                      </div>

                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        Ref: {classDef.normalRange}
                      </span>

                      {/* Batch Verify Button */}
                      <button
                        onClick={() => onVerifyGroup(classId)}
                        disabled={allVerified || count === 0}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                          allVerified
                            ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                            : 'text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>{allVerified ? 'Verified' : 'Verify All'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Cell Micrographs Grid */}
              {!isCollapsed && (
                <div className="p-3 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5 min-h-[90px]">
                  {count === 0 ? (
                    <div className="col-span-full py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl font-mono">
                      Drag cells here to classify into {classDef.name}
                    </div>
                  ) : (
                    classCells.map(cell => {
                      const isSelected = selectedCellId === cell.id;
                      const isBeingDragged = draggedCellId === cell.id;
                      const classSpec = CELLAVISION_CLASSES[cell.verifiedClassId] || CELLAVISION_CLASSES.unclassified;

                      return (
                        <div
                          key={cell.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, cell)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onSelectCell(cell.id)}
                          title={`Cell #${cell.tileIndex} (${classSpec.name}) - Drag to another category to reclassify`}
                          className={`relative aspect-square rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border transition-all duration-150 select-none group ${
                            isBeingDragged
                              ? 'opacity-30 scale-95 ring-2 ring-rose-500 border-rose-500 bg-slate-900'
                              : isSelected
                              ? 'border-rose-400 ring-2 ring-rose-500/60 scale-105 z-10 shadow-lg shadow-rose-950/60 bg-slate-950'
                              : cell.isVerified
                              ? 'border-slate-800 hover:border-slate-500 bg-slate-950/80 hover:shadow-md'
                              : 'border-amber-500/30 hover:border-amber-400 bg-slate-950/90'
                          }`}
                        >
                          {/* Drag Affordance Grip Handle */}
                          <div className="absolute top-1 left-1 flex items-center space-x-0.5 text-[9px] font-mono text-slate-400 px-1 py-0.2 rounded bg-slate-950/80 z-20 group-hover:text-white">
                            <GripVertical className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                            <span>#{cell.tileIndex}</span>
                          </div>

                          {/* Cell Micrograph Render */}
                          <div className="w-full h-full flex items-center justify-center p-0.5 pointer-events-none">
                            {displayMode === 'real_photos' || cell.customImageUrl ? (
                              <img
                                src={cell.customImageUrl || REAL_CELL_PHOTO_MAP[cell.verifiedClassId]}
                                alt={`Cell ${cell.tileIndex}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: classSpec.svgRender(56, {
                                    rot: cell.aspectVariants?.rotation,
                                    bright: cell.aspectVariants?.brightness,
                                    cont: cell.aspectVariants?.contrast,
                                  }),
                                }}
                                className="w-full h-full flex items-center justify-center pointer-events-none"
                              />
                            )}
                          </div>

                          {/* Verification Icon */}
                          {cell.isVerified && (
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500/90 flex items-center justify-center text-white z-20">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}

                          {/* Reclassified Badge */}
                          {cell.reclassified && !cell.isVerified && (
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 z-20" title="Reclassified by technologist" />
                          )}

                          {/* Bottom Bar: AI Confidence or Reclassified Flag */}
                          <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 px-1 py-0.5 text-[9px] font-mono flex items-center justify-between text-slate-400 z-20">
                            <span className={cell.reclassified ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                              {cell.reclassified ? 'MOD' : `${Math.round(cell.aiConfidence * 100)}%`}
                            </span>
                            <span className="text-[8px] text-slate-500 truncate">
                              {classSpec.shortLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
