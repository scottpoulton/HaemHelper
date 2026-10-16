import React from 'react';
import { RbcMorphologyGrading, PlateletEstimation, CbcAnalyzerIndices } from '../types';
import { Disc, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

interface RbcPlateletPanelProps {
  rbcGrading: RbcMorphologyGrading;
  onUpdateRbcGrading: (newGrading: RbcMorphologyGrading) => void;
  plateletEstimation: PlateletEstimation;
  onUpdatePlateletEstimation: (newEst: PlateletEstimation) => void;
  analyzerIndices: CbcAnalyzerIndices;
}

export const RbcPlateletPanel: React.FC<RbcPlateletPanelProps> = ({
  rbcGrading,
  onUpdateRbcGrading,
  plateletEstimation,
  onUpdatePlateletEstimation,
  analyzerIndices,
}) => {
  const morphologyItems: Array<{ key: keyof RbcMorphologyGrading; label: string; desc: string }> = [
    { key: 'anisocytosis', label: 'Anisocytosis', desc: 'Variation in RBC diameter / size' },
    { key: 'poikilocytosis', label: 'Poikilocytosis', desc: 'Variation in RBC shape' },
    { key: 'hypochromia', label: 'Hypochromia', desc: 'Exaggerated central pallor > 1/2 diameter' },
    { key: 'polychromasia', label: 'Polychromasia', desc: 'Bluish-grey immature reticulocytes' },
    { key: 'targetCells', label: 'Target Cells (Codocytes)', desc: 'Bullseye hemoglobin distribution' },
    { key: 'schistocytes', label: 'Schistocytes', desc: 'Fragmented helmet cells (MAHA / TTP / DIC)' },
    { key: 'spherocytes', label: 'Spherocytes', desc: 'Dense round RBCs lacking central pallor' },
    { key: 'teardropCells', label: 'Teardrop Cells (Dacrocytes)', desc: 'Marrow fibrosis / space-occupying lesions' },
    { key: 'howellJollyBodies', label: 'Howell-Jolly Bodies', desc: 'DNA nuclear remnants (hyposplenism)' },
  ];

  const handleGradeChange = (key: keyof RbcMorphologyGrading, grade: 0 | 1 | 2 | 3) => {
    onUpdateRbcGrading({
      ...rbcGrading,
      [key]: grade,
    });
  };

  const handleFieldAvgChange = (avg: number) => {
    const estimated = Math.round(avg * 15);
    onUpdatePlateletEstimation({
      ...plateletEstimation,
      averagePerField100x: avg,
      estimatedCount: estimated,
    });
  };

  // Compare manual microscopy estimate with automated analyzer
  const analyzerPlt = analyzerIndices.plt;
  const estimateDelta = Math.abs(plateletEstimation.estimatedCount - analyzerPlt);
  const isDiscrepant = estimateDelta > 50;

  return (
    <div className="space-y-6">
      {/* RBC Morphology Grading Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Disc className="w-4 h-4 text-rose-400" />
              Erythrocyte (RBC) Morphology Characterization
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Semi-quantitative grading standard: <span className="font-mono text-slate-300">0 (Normal)</span> · <span className="font-mono text-slate-300">1+ (Slight 5-10%)</span> · <span className="font-mono text-slate-300">2+ (Moderate 10-25%)</span> · <span className="font-mono text-slate-300">3+ (Marked &gt;25%)</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {morphologyItems.map(({ key, label, desc }) => {
            const currentGrade = rbcGrading[key];
            const isAbnormal = currentGrade > 0;

            return (
              <div
                key={key}
                className={`p-3 rounded-xl border transition-all ${
                  currentGrade >= 2
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : isAbnormal
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-white tracking-tight">{label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{desc}</div>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                      currentGrade === 0
                        ? 'text-slate-500 bg-slate-900'
                        : currentGrade === 1
                        ? 'text-amber-400 bg-amber-950/60'
                        : 'text-rose-400 bg-rose-950/60'
                    }`}
                  >
                    {currentGrade === 0 ? 'None' : `${currentGrade}+`}
                  </span>
                </div>

                {/* Grade Selector Buttons */}
                <div className="mt-3 flex space-x-1">
                  {([0, 1, 2, 3] as const).map(grade => (
                    <button
                      key={grade}
                      onClick={() => handleGradeChange(key, grade)}
                      className={`flex-1 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        currentGrade === grade
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                      }`}
                    >
                      {grade === 0 ? '0' : `${grade}+`}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platelet Estimation Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Platelet (Thrombocyte) Estimation & Morphological Review</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Standard laboratory method: Average platelets per 100x oil field × 15 = Estimated Count (× 10⁹/L).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 block text-[11px] uppercase">100x Oil Field Average</span>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                step="0.5"
                min="0"
                max="60"
                value={plateletEstimation.averagePerField100x}
                onChange={(e) => handleFieldAvgChange(parseFloat(e.target.value) || 0)}
                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold text-lg"
              />
              <span className="text-slate-400">PLTs / 100x HPF</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Evaluated across 10 representative fields in ideal monolayer.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[11px] uppercase">Estimated vs. Analyzer Plt</span>
            <div className="text-xl font-bold text-white mt-1">
              {plateletEstimation.estimatedCount} <span className="text-xs text-slate-500 font-normal">× 10⁹/L</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Automated Analyzer: <strong className="text-indigo-400">{analyzerPlt} × 10⁹/L</strong>
            </div>
            {isDiscrepant ? (
              <div className="text-[11px] text-amber-400 flex items-center gap-1 pt-1">
                <AlertCircle className="w-3.5 h-3.5" /> Significant discrepancy (&gt;50 × 10⁹/L)
              </div>
            ) : (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Correlates with automated analyzer
              </div>
            )}
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 block text-[11px] uppercase">Platelet Morphology Note</span>
            <select
              value={plateletEstimation.morphologyNote}
              onChange={(e) =>
                onUpdatePlateletEstimation({
                  ...plateletEstimation,
                  morphologyNote: e.target.value as any,
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs font-mono"
            >
              <option value="Normal morphology">Normal morphology</option>
              <option value="Giant platelets present">Giant platelets present</option>
              <option value="Platelet clumping observed">Platelet clumping observed (EDTA effect)</option>
              <option value="Severe thrombocytopenia">Severe thrombocytopenia</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
