import React, { useState } from 'react';
import { ClinicalPatientCase, CellaVisionClassId } from '../types';
import { CELLAVISION_CLASSES } from '../data/cellDefinitions';
import { ShieldCheck, Printer, Download, CheckCircle, X, AlertTriangle, FileText, UserCheck } from 'lucide-react';

interface PathologyReportModalProps {
  caseData: ClinicalPatientCase;
  isOpen: boolean;
  onClose: () => void;
  onSignOff: (pathologistName: string, comments: string) => void;
}

export const PathologyReportModal: React.FC<PathologyReportModalProps> = ({
  caseData,
  isOpen,
  onClose,
  onSignOff,
}) => {
  const [pathologistName, setPathologistName] = useState('Dr. A. Montgomery, FRCPath');
  const [pathologistComments, setPathologistComments] = useState(
    'Peripheral blood smear confirms marked left shift with toxic changes consistent with severe bacterial sepsis. Urgent clinical correlation advised.'
  );

  if (!isOpen) return null;

  // Calculate AI vs Human stats
  const totalCells = caseData.cells.length;
  const reclassifiedCells = caseData.cells.filter(c => c.reclassified);
  const accuracy = totalCells > 0 ? (((totalCells - reclassifiedCells.length) / totalCells) * 100).toFixed(1) : '100.0';

  // Count verified differential
  const verifiedCounts: Record<CellaVisionClassId, number> = Object.keys(CELLAVISION_CLASSES).reduce(
    (acc, key) => {
      acc[key as CellaVisionClassId] = 0;
      return acc;
    },
    {} as Record<CellaVisionClassId, number>
  );

  const aiPreCounts: Record<CellaVisionClassId, number> = { ...verifiedCounts };

  caseData.cells.forEach(c => {
    verifiedCounts[c.verifiedClassId] = (verifiedCounts[c.verifiedClassId] || 0) + 1;
    aiPreCounts[c.aiPreClassId] = (aiPreCounts[c.aiPreClassId] || 0) + 1;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const reportData = {
      institution: 'Department of Laboratory Haematology - CellaVision Digital Morphology Suite',
      reportType: 'Validated Peripheral Blood Smear Examination',
      accessionNumber: caseData.accessionNumber,
      patient: {
        name: caseData.patientName,
        ageGender: caseData.patientAgeGender,
        department: caseData.department,
        collectionTime: caseData.collectionTime,
        clinicalHistory: caseData.clinicalHistory,
      },
      cbcAnalyzerIndices: caseData.analyzerIndices,
      differentialLeukocyteCount: (Object.keys(CELLAVISION_CLASSES) as CellaVisionClassId[])
        .filter(k => verifiedCounts[k] > 0 || aiPreCounts[k] > 0)
        .map(k => ({
          class: CELLAVISION_CLASSES[k].name,
          aiPreClassCount: aiPreCounts[k],
          verifiedCount: verifiedCounts[k],
          percentage: `${((verifiedCounts[k] / totalCells) * 100).toFixed(1)}%`,
          referenceRange: CELLAVISION_CLASSES[k].normalRange,
        })),
      rbcMorphology: caseData.rbcGrading,
      plateletEstimation: caseData.plateletEstimation,
      audit: {
        totalCellsEvaluated: totalCells,
        aiAgreementRate: `${accuracy}%`,
        reclassificationsCount: reclassifiedCells.length,
      },
      signOff: {
        status: caseData.reviewStatus,
        technician: caseData.technicianName,
        technicianComments: caseData.technicianComments,
        pathologist: pathologistName,
        pathologistComments,
        timestamp: new Date().toISOString(),
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `haematology_report_${caseData.accessionNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFinalSignOff = () => {
    onSignOff(pathologistName, pathologistComments);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>Laboratory Information System (LIS) • Pathology Validation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Peripheral Blood Smear Examination Report
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Accession: <strong className="text-white font-mono">{caseData.accessionNumber}</strong> · Patient: <strong className="text-white">{caseData.patientName}</strong> ({caseData.patientAgeGender})
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportJson}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              title="Export JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clinical Presentation & CBC Analyzer Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold block text-[11px] uppercase">Clinical Indication</span>
            <p className="text-slate-200">{caseData.clinicalHistory}</p>
            <div className="text-slate-400 pt-1 text-[11px]">
              Dept: {caseData.department} · Sample Collected: {caseData.collectionTime}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono">
            <span className="text-slate-400 font-semibold block text-[11px] uppercase">Automated CBC Analyzer Parameters</span>
            <div className="grid grid-cols-4 gap-2 text-slate-300 text-[11px] pt-0.5">
              <div>WBC: <strong className="text-white">{caseData.analyzerIndices.wbc}</strong></div>
              <div>RBC: <strong className="text-white">{caseData.analyzerIndices.rbc}</strong></div>
              <div>Hgb: <strong className="text-white">{caseData.analyzerIndices.hgb}</strong></div>
              <div>Plt: <strong className="text-white">{caseData.analyzerIndices.plt}</strong></div>
            </div>
            <div className="flex flex-wrap gap-1 pt-1.5">
              {caseData.analyzerIndices.flags.map((flag, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {flag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* AI Pre-Classification vs Verified Audit Summary */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 text-xs space-y-2">
          <div className="flex items-center justify-between font-mono">
            <span className="text-indigo-300 font-bold uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              CellaVision AI Pre-Classification & Verification Audit
            </span>
            <span className="text-white">
              Model Agreement Rate: <strong className="text-emerald-400 text-sm">{accuracy}%</strong>
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">
            {totalCells} individual leukocytes were scanned and located across the slide monolayer. The technologist verified all cells and performed <strong>{reclassifiedCells.length} reclassifications</strong>.
          </p>

          {reclassifiedCells.length > 0 && (
            <div className="mt-2 pt-2 border-t border-indigo-900/40 space-y-1 font-mono text-[11px]">
              <span className="text-amber-300 block font-semibold">Technologist Corrections / Reclassifications:</span>
              <div className="max-h-24 overflow-y-auto space-y-0.5 text-slate-300">
                {reclassifiedCells.map(c => (
                  <div key={c.id}>
                    • Cell #{c.tileIndex}: Pre-classified as <span className="text-slate-400 line-through">{CELLAVISION_CLASSES[c.aiPreClassId].name}</span> → Reclassified to <strong className="text-emerald-400">{CELLAVISION_CLASSES[c.verifiedClassId].name}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Final Verified Differential Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
            Validated 100-WBC Differential Count
          </h4>
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 font-mono text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900/90 text-slate-400 text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Cell Lineage</th>
                  <th className="p-2.5 text-right">AI Pre-Class</th>
                  <th className="p-2.5 text-right">Verified Count</th>
                  <th className="p-2.5 text-right">% of WBCs</th>
                  <th className="p-2.5 text-right">Normal Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                {(Object.keys(CELLAVISION_CLASSES) as CellaVisionClassId[])
                  .filter(k => verifiedCounts[k] > 0 || aiPreCounts[k] > 0)
                  .map(k => {
                    const def = CELLAVISION_CLASSES[k];
                    const vCount = verifiedCounts[k];
                    const aiCount = aiPreCounts[k];
                    const pct = ((vCount / totalCells) * 100).toFixed(1);
                    const isDiff = vCount !== aiCount;

                    return (
                      <tr key={k} className="hover:bg-slate-900/50">
                        <td className="p-2.5 font-sans font-medium text-white flex items-center gap-1.5">
                          {def.name}
                          <span className="text-[10px] text-slate-500 font-mono">({def.shortLabel})</span>
                        </td>
                        <td className="p-2.5 text-right text-slate-400">{aiCount}</td>
                        <td className={`p-2.5 text-right font-bold ${isDiff ? 'text-amber-400' : 'text-white'}`}>
                          {vCount}
                        </td>
                        <td className="p-2.5 text-right text-emerald-400 font-bold">{pct}%</td>
                        <td className="p-2.5 text-right text-slate-400">{def.normalRange}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RBC & Platelet Findings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-semibold block text-[11px] uppercase">RBC Morphology Findings</span>
            <div className="text-slate-300 text-[11px] space-y-0.5">
              <div>Anisocytosis: {caseData.rbcGrading.anisocytosis}+ · Poikilocytosis: {caseData.rbcGrading.poikilocytosis}+</div>
              <div>Hypochromia: {caseData.rbcGrading.hypochromia}+ · Polychromasia: {caseData.rbcGrading.polychromasia}+</div>
              {caseData.rbcGrading.schistocytes > 0 && <div className="text-rose-400 font-bold">Schistocytes: {caseData.rbcGrading.schistocytes}+</div>}
              {caseData.rbcGrading.teardropCells > 0 && <div className="text-amber-400">Teardrop cells: {caseData.rbcGrading.teardropCells}+</div>}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-semibold block text-[11px] uppercase">Platelet Estimation Findings</span>
            <div className="text-slate-300 text-[11px] space-y-0.5">
              <div>Average PLTs: <strong>{caseData.plateletEstimation.averagePerField100x}</strong> / 100x oil field</div>
              <div>Estimated PLT Count: <strong>{caseData.plateletEstimation.estimatedCount} × 10⁹/L</strong></div>
              <div className="text-indigo-400">Note: {caseData.plateletEstimation.morphologyNote}</div>
            </div>
          </div>
        </div>

        {/* Pathologist Diagnostic Sign-Off Section */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Pathologist Diagnostic Interpretation & Final Sign-Off
            </h4>
            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
              caseData.reviewStatus === 'Signed Off'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              Status: {caseData.reviewStatus}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Senior Pathologist Name / Credentials:</label>
              <input
                type="text"
                value={pathologistName}
                onChange={(e) => setPathologistName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Diagnostic Comments & Recommendations:</label>
              <textarea
                rows={3}
                value={pathologistComments}
                onChange={(e) => setPathologistComments(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-sans text-xs leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-slate-500 text-[11px]">
                Technologist Verification: {caseData.technicianName} ({caseData.technicianComments})
              </div>

              <button
                onClick={handleFinalSignOff}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 cursor-pointer transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Sign Off & Transmit to LIS</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
