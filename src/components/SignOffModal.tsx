import React, { useState } from 'react';
import { ClinicalPatientCase, CellaVisionClassId } from '../types';
import { CELLAVISION_CLASSES } from '../data/cellDefinitions';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  Download,
} from 'lucide-react';

interface SignOffModalProps {
  caseData: ClinicalPatientCase;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSignOff: (data: {
    reviewerName: string;
    reviewerComments: string;
  }) => void;
}

export const SignOffModal: React.FC<SignOffModalProps> = ({
  caseData,
  isOpen,
  onClose,
  onConfirmSignOff,
}) => {
  const [reviewerName, setReviewerName] = useState(
    caseData.pathologistName || caseData.technicianName || 'S. Poulton'
  );
  const [reviewerComments, setReviewerComments] = useState(
    caseData.pathologistComments || caseData.technicianComments || ''
  );

  if (!isOpen) return null;

  const totalCells = caseData.cells.length;
  const verifiedCellsCount = caseData.cells.filter(c => c.isVerified).length;
  const reclassifiedCells = caseData.cells.filter(c => c.reclassified);

  const verifiedCounts: Record<CellaVisionClassId, number> = Object.keys(CELLAVISION_CLASSES).reduce(
    (acc, key) => {
      acc[key as CellaVisionClassId] = 0;
      return acc;
    },
    {} as Record<CellaVisionClassId, number>
  );

  const preClassCounts: Record<CellaVisionClassId, number> = { ...verifiedCounts };

  caseData.cells.forEach(c => {
    verifiedCounts[c.verifiedClassId] = (verifiedCounts[c.verifiedClassId] || 0) + 1;
    preClassCounts[c.aiPreClassId] = (preClassCounts[c.aiPreClassId] || 0) + 1;
  });

  const activeDifferentialItems = (Object.keys(CELLAVISION_CLASSES) as CellaVisionClassId[])
    .filter(k => verifiedCounts[k] > 0 || preClassCounts[k] > 0)
    .map(k => {
      const count = verifiedCounts[k];
      const preCount = preClassCounts[k];
      const percentage = totalCells > 0 ? ((count / totalCells) * 100).toFixed(1) : '0.0';
      const def = CELLAVISION_CLASSES[k];

      let flagLabel = 'Normal';
      if (k === 'blast' && count > 0) flagLabel = 'CRITICAL';
      else if (k === 'band_neutrophil' && count > 5) flagLabel = 'HIGH (Left Shift)';
      else if (k === 'segmented_neutrophil' && Number(percentage) > 75) flagLabel = 'HIGH';
      else if (k === 'basophil' && Number(percentage) > 2) flagLabel = 'HIGH';
      else if (k === 'eosinophil' && Number(percentage) > 6) flagLabel = 'HIGH';

      return {
        id: k,
        name: def.name,
        shortLabel: def.shortLabel,
        preCount,
        count,
        delta: count - preCount,
        percentage,
        normalRange: def.normalRange,
        flagLabel,
      };
    })
    .sort((a, b) => b.count - a.count);

  const hasBlasts = (verifiedCounts.blast || 0) > 0;

  const handleExportCsv = () => {
    const headers = ['Lineage', 'ShortLabel', 'PreClassified', 'VerifiedCount', 'Percentage', 'ReferenceRange', 'Flag'];
    const rows = activeDifferentialItems.map(item => [
      `"${item.name}"`,
      item.shortLabel,
      item.preCount,
      item.count,
      `${item.percentage}%`,
      `"${item.normalRange}"`,
      `"${item.flagLabel}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `differential_${caseData.accessionNumber}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono uppercase tracking-wider mb-1">
              <ClipboardCheck className="w-4 h-4 text-emerald-400" />
              <span>Differential Review & Verification Summary</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {caseData.accessionNumber} — {caseData.patientName}
            </h2>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 font-mono">
              <span>Verified: {verifiedCellsCount}/{totalCells} cells</span>
              <span>·</span>
              <span>Reclassified: {reclassifiedCells.length} cells</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Critical Finding Alert */}
        {hasBlasts && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start space-x-3 text-xs text-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-rose-300 block">
                Critical Morphology Flag: Circulating Blasts ({verifiedCounts.blast}%)
              </strong>
              <span>
                Presence of peripheral blasts requires urgent clinical correlation and haematology review.
              </span>
            </div>
          </div>
        )}

        {/* Differential Comparison Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Pre-Classification vs. Verified Count ({totalCells} Cells)
            </h3>
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Lineage</th>
                  <th className="p-2.5 text-right">Pre-Class</th>
                  <th className="p-2.5 text-right">Verified</th>
                  <th className="p-2.5 text-right">Delta</th>
                  <th className="p-2.5 text-right">%</th>
                  <th className="p-2.5 text-right">Ref Range</th>
                  <th className="p-2.5 text-right">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                {activeDifferentialItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-sans font-medium text-white">
                      {item.name} <span className="text-[10px] text-slate-500 font-mono">({item.shortLabel})</span>
                    </td>
                    <td className="p-2.5 text-right text-slate-400">{item.preCount}</td>
                    <td className="p-2.5 text-right font-bold text-white">{item.count}</td>
                    <td
                      className={`p-2.5 text-right ${
                        item.delta === 0
                          ? 'text-slate-600'
                          : item.delta > 0
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {item.delta > 0 ? `+${item.delta}` : item.delta}
                    </td>
                    <td className="p-2.5 text-right text-emerald-400 font-bold">{item.percentage}%</td>
                    <td className="p-2.5 text-right text-slate-400">{item.normalRange}</td>
                    <td className="p-2.5 text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.flagLabel === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : item.flagLabel.includes('HIGH')
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.flagLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reviewer Notes */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 font-medium block mb-1">
              Reviewed By:
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">
              Morphology Notes & Interpretation:
            </label>
            <textarea
              rows={3}
              value={reviewerComments}
              onChange={(e) => setReviewerComments(e.target.value)}
              placeholder="Enter morphological observations (e.g., toxic granulation, left shift, platelet clumping)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-sans text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onConfirmSignOff({
                reviewerName,
                reviewerComments,
              })
            }
            className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Mark Verified</span>
          </button>
        </div>

      </div>
    </div>
  );
};