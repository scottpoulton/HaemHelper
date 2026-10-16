import React, { useEffect } from 'react';
import { Calculator, AlertTriangle, CheckCircle, RotateCcw, Download, Sparkles, Plus, Minus } from 'lucide-react';
import { HAEMATOLOGY_CLASSES } from '../data/bloodCellsData';

interface DifferentialCounterViewProps {
  counts: Record<string, number>;
  onIncrement: (classId: string) => void;
  onDecrement: (classId: string) => void;
  onReset: () => void;
}

export const DifferentialCounterView: React.FC<DifferentialCounterViewProps> = ({
  counts,
  onIncrement,
  onDecrement,
  onReset,
}) => {
  // Only count leukocyte classes towards the 100-WBC diff
  const wbcClasses = HAEMATOLOGY_CLASSES.filter(c => c.category !== 'Erythrocyte' && c.category !== 'Thrombocyte');
  const totalWbcCount = wbcClasses.reduce((sum, c) => sum + (counts[c.id] || 0), 0);

  // Keyboard shortcut listener for laboratory differential counters
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'N') onIncrement('neutrophil');
      else if (key === 'L') onIncrement('lymphocyte');
      else if (key === 'M') onIncrement('monocyte');
      else if (key === 'E') onIncrement('eosinophil');
      else if (key === 'B') onIncrement('basophil');
      else if (key === 'X') onIncrement('myeloblast');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onIncrement]);

  const handleExportReport = () => {
    const report = {
      test: '100-WBC Peripheral Blood Smear Differential',
      timestamp: new Date().toISOString(),
      total_wbc_tallied: totalWbcCount,
      differential: wbcClasses.map(c => {
        const cnt = counts[c.id] || 0;
        const pct = totalWbcCount > 0 ? ((cnt / totalWbcCount) * 100).toFixed(1) : '0.0';
        return {
          cell_type: c.name,
          count: cnt,
          percentage: `${pct}%`,
          reference_range: c.referencePercentage,
        };
      }),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `haematology_differential_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>Clinical Pathology Standard Practice</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            100-Cell Differential Counter
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Tally leukocyte subclasses under high-power field microscopy to assess relative proportions, left shifts, and hematologic emergencies. Supports rapid keyboard shortcuts (<span className="font-mono text-rose-300 font-bold">N</span>, <span className="font-mono text-rose-300 font-bold">L</span>, <span className="font-mono text-rose-300 font-bold">M</span>, <span className="font-mono text-rose-300 font-bold">E</span>, <span className="font-mono text-rose-300 font-bold">B</span>, <span className="font-mono text-rose-300 font-bold">X</span>).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportReport}
            disabled={totalWbcCount === 0}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Report (JSON)</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-medium border border-slate-700 cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Counts</span>
          </button>
        </div>
      </div>

      {/* Progress to 100 Cells */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-white">Differential Progress:</span>
            <span className={`text-sm font-mono font-bold ${totalWbcCount >= 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalWbcCount} / 100 Cells
            </span>
          </div>
          {totalWbcCount >= 100 ? (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Complete 100-cell sample reached
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              {100 - totalWbcCount} cells remaining
            </span>
          )}
        </div>

        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              totalWbcCount >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-rose-500 via-crimson-500 to-indigo-500'
            }`}
            style={{ width: `${Math.min(100, (totalWbcCount / 100) * 100)}%` }}
          />
        </div>
      </div>

      {/* Leukocyte Grid Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wbcClasses.map((cell) => {
          const count = counts[cell.id] || 0;
          const percentage = totalWbcCount > 0 ? ((count / totalWbcCount) * 100).toFixed(1) : '0.0';
          
          // Determine hotkey
          let hotkey = '';
          if (cell.id === 'neutrophil') hotkey = 'N';
          if (cell.id === 'lymphocyte') hotkey = 'L';
          if (cell.id === 'monocyte') hotkey = 'M';
          if (cell.id === 'eosinophil') hotkey = 'E';
          if (cell.id === 'basophil') hotkey = 'B';
          if (cell.id === 'myeloblast') hotkey = 'X';

          const isCritical = cell.id === 'myeloblast' && count > 0;

          return (
            <div
              key={cell.id}
              className={`p-5 rounded-2xl border transition-all ${
                isCritical
                  ? 'bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-950/40'
                  : 'bg-slate-900/90 border-slate-800 shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {cell.name}
                    </h3>
                    {hotkey && (
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-rose-300 font-mono text-[10px] font-bold border border-slate-700">
                        {hotkey}
                      </kbd>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Ref: <span className="font-mono text-slate-300">{cell.referencePercentage.split('(')[0]}</span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center shrink-0">
                  <div dangerouslySetInnerHTML={{ __html: cell.svgRender(40) }} />
                </div>
              </div>

              {/* Count & Percentage Display */}
              <div className="mt-4 flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-3xl font-extrabold font-mono text-white">
                    {count}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {percentage}% of WBCs
                  </div>
                </div>

                {/* Plus / Minus Buttons */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onDecrement(cell.id)}
                    disabled={count === 0}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 flex items-center justify-center border border-slate-700 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onIncrement(cell.id)}
                    className="w-9 h-9 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md cursor-pointer font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status / Alert */}
              <div className="mt-3 text-xs">
                {isCritical ? (
                  <div className="flex items-center space-x-1.5 text-rose-400 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Leukaemic Blasts present! Urgent review.</span>
                  </div>
                ) : (
                  <div className="text-slate-400 text-[11px] truncate">
                    {cell.keyFeatures.join(' • ')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
