import React, { useState, useRef, useEffect } from 'react';
import { ClinicalPatientCase, CellaVisionClassId } from '../types';
import { CELLAVISION_CLASSES } from '../data/cellDefinitions';
import { 
  ShieldCheck, 
  X, 
  PenTool, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Lock, 
  KeyRound,
  Download,
  Printer
} from 'lucide-react';

interface SignOffModalProps {
  caseData: ClinicalPatientCase;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSignOff: (data: {
    pathologistName: string;
    pathologistLicense: string;
    pathologistComments: string;
    electronicSignature: string;
    signatureHash: string;
  }) => void;
}

export const SignOffModal: React.FC<SignOffModalProps> = ({
  caseData,
  isOpen,
  onClose,
  onConfirmSignOff,
}) => {
  const [pathologistName, setPathologistName] = useState(
    caseData.pathologistName || 'Dr. Arthur Montgomery, MD, FRCPath'
  );
  const [pathologistLicense, setPathologistLicense] = useState(
    caseData.pathologistLicense || 'MD-849201-HEM'
  );
  const [pathologistComments, setPathologistComments] = useState(
    caseData.pathologistComments ||
      'Peripheral blood film reviewed. Morphological features and differential verified. Clinical correlation and follow-up CBC recommended.'
  );
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('Arthur Montgomery');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [attestationAccepted, setAttestationAccepted] = useState(false);
  const [attestationError, setAttestationError] = useState('');

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen && signatureMode === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = '#38bdf8'; // bright clinical cyan/blue ink
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    }
  }, [isOpen, signatureMode]);

  if (!isOpen) return null;

  // Calculate WBC differential summary
  const totalCells = caseData.cells.length;
  const verifiedCounts: Record<CellaVisionClassId, number> = Object.keys(CELLAVISION_CLASSES).reduce(
    (acc, key) => {
      acc[key as CellaVisionClassId] = 0;
      return acc;
    },
    {} as Record<CellaVisionClassId, number>
  );

  caseData.cells.forEach(c => {
    verifiedCounts[c.verifiedClassId] = (verifiedCounts[c.verifiedClassId] || 0) + 1;
  });

  const activeDifferentialItems = (Object.keys(CELLAVISION_CLASSES) as CellaVisionClassId[])
    .filter(k => verifiedCounts[k] > 0)
    .map(k => {
      const count = verifiedCounts[k];
      const percentage = totalCells > 0 ? ((count / totalCells) * 100).toFixed(1) : '0.0';
      const def = CELLAVISION_CLASSES[k];
      
      // Determine if out of reference range
      let isAbnormal = false;
      let alertLabel = 'Normal';
      if (k === 'blast' && count > 0) {
        isAbnormal = true;
        alertLabel = 'CRITICAL';
      } else if (k === 'band_neutrophil' && count > 5) {
        isAbnormal = true;
        alertLabel = 'HIGH (Left Shift)';
      } else if (k === 'segmented_neutrophil' && Number(percentage) > 75) {
        isAbnormal = true;
        alertLabel = 'HIGH';
      } else if (k === 'basophil' && Number(percentage) > 2) {
        isAbnormal = true;
        alertLabel = 'HIGH';
      } else if (k === 'eosinophil' && Number(percentage) > 6) {
        isAbnormal = true;
        alertLabel = 'HIGH';
      }

      return {
        id: k,
        name: def.name,
        shortLabel: def.shortLabel,
        count,
        percentage,
        normalRange: def.normalRange,
        isAbnormal,
        alertLabel,
      };
    })
    .sort((a, b) => b.count - a.count);

  // Critical alerts
  const hasBlasts = (verifiedCounts.blast || 0) > 0;
  const hasBandLeftShift = (verifiedCounts.band_neutrophil || 0) > 5;

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  // Submission handler
  const handleSignAndSubmit = () => {
    setPinError('');
    setAttestationError('');

    if (!attestationAccepted) {
      setAttestationError('You must check the certification attestation before signing.');
      return;
    }

    if (!pin || pin.length < 4) {
      setPinError('Please enter a 4-digit authorization PIN (e.g. 2026).');
      return;
    }

    let signatureData = '';
    if (signatureMode === 'draw') {
      if (!hasDrawn && !caseData.electronicSignature) {
        setAttestationError('Please provide your handwritten signature on the signature pad.');
        return;
      }
      signatureData = canvasRef.current ? canvasRef.current.toDataURL() : '';
    } else {
      if (!typedSignature.trim()) {
        setAttestationError('Please type your legal signature name.');
        return;
      }
      signatureData = `data:text/plain;certified=${encodeURIComponent(typedSignature.trim())}`;
    }

    // Generate cryptographic hash simulation
    const timestamp = new Date().toISOString();
    const seed = `${caseData.accessionNumber}-${pathologistLicense}-${timestamp}`;
    const signatureHash = `SHA256:${Array.from(seed).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0).toString(16).padStart(8, '0')}f7e8a9`;

    onConfirmSignOff({
      pathologistName,
      pathologistLicense,
      pathologistComments,
      electronicSignature: signatureData || caseData.electronicSignature || '',
      signatureHash,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto">
        
        {/* Header with Title and Accession */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono uppercase tracking-wider mb-1">
              <FileCheck className="w-4 h-4 text-rose-400" />
              <span>CellaVision Digital Morphology • Final Clinical Sign-Off</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Pathologist Electronic Sign-Off & Verification
            </h2>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-2">
              <span>Accession: <strong className="text-white font-mono">{caseData.accessionNumber}</strong></span>
              <span>·</span>
              <span>Patient: <strong className="text-white">{caseData.patientName}</strong> ({caseData.patientAgeGender})</span>
              <span>·</span>
              <span>Dept: {caseData.department}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Alert Banners if critical */}
        {hasBlasts && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-start space-x-3 text-xs text-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-rose-300 block text-sm">
                CRITICAL VALUE: Circulating Blasts Detected ({verifiedCounts.blast}%)
              </strong>
              <span>
                Leukaemic precursors present in peripheral blood. Requires urgent hematopathology confirmation and clinical notification.
              </span>
            </div>
          </div>
        )}

        {hasBandLeftShift && !hasBlasts && (
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start space-x-3 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-300">
                Significant Left Shift ({verifiedCounts.band_neutrophil}% Band Neutrophils)
              </strong>
              <span>
                Elevated immature granulocytic precursors indicating severe systemic infection, leukemoid reaction, or inflammatory crisis.
              </span>
            </div>
          </div>
        )}

        {/* WBC Differential Summary Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>WBC Differential Summary ({totalCells} Cells Evaluated)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Analyzer WBC: <strong className="text-white">{caseData.analyzerIndices.wbc} × 10⁹/L</strong>
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden font-mono text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900/90 text-slate-400 text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Lineage</th>
                  <th className="p-2.5 text-right">Count</th>
                  <th className="p-2.5 text-right">% of WBCs</th>
                  <th className="p-2.5 text-right">Reference Range</th>
                  <th className="p-2.5 text-right">Clinical Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                {activeDifferentialItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-sans font-medium text-white flex items-center space-x-2">
                      <span>{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({item.shortLabel})</span>
                    </td>
                    <td className="p-2.5 text-right font-bold text-white">{item.count}</td>
                    <td className="p-2.5 text-right text-emerald-400 font-bold">{item.percentage}%</td>
                    <td className="p-2.5 text-right text-slate-400">{item.normalRange}</td>
                    <td className="p-2.5 text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.alertLabel === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : item.alertLabel.includes('HIGH')
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.alertLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pathologist Credentials & Clinical Findings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium block mb-1">
              Signing Pathologist:
            </label>
            <input
              type="text"
              value={pathologistName}
              onChange={(e) => setPathologistName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">
              Medical License / Registration #:
            </label>
            <input
              type="text"
              value={pathologistLicense}
              onChange={(e) => setPathologistLicense(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
            />
          </div>
        </div>

        {/* Pathologist Diagnostic Interpretation */}
        <div>
          <label className="text-slate-400 font-medium block mb-1 text-xs">
            Pathologist Diagnostic Impression & Comments:
          </label>
          <textarea
            rows={3}
            value={pathologistComments}
            onChange={(e) => setPathologistComments(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-sans text-xs leading-relaxed"
          />
        </div>

        {/* Simulated Electronic Signature Section */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <PenTool className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Simulated Electronic Signature (21 CFR Part 11 / CAP)
              </h4>
            </div>

            {/* Mode toggle */}
            <div className="bg-slate-900 p-1 rounded-xl flex space-x-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setSignatureMode('draw')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  signatureMode === 'draw' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Draw Signature
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('type')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  signatureMode === 'type' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Type Signature
              </button>
            </div>
          </div>

          {/* Signature Capture Area */}
          {signatureMode === 'draw' ? (
            <div className="space-y-2">
              <div className="relative border border-slate-700 rounded-xl bg-slate-900/90 overflow-hidden h-28 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={680}
                  height={112}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair"
                />
                {!hasDrawn && !caseData.electronicSignature && (
                  <div className="absolute pointer-events-none text-slate-500 text-xs font-mono">
                    Sign with mouse, trackpad, or pen inside this box
                  </div>
                )}
                {caseData.electronicSignature && !hasDrawn && (
                  <img
                    src={caseData.electronicSignature}
                    alt="Existing Signature"
                    className="absolute max-h-20 object-contain pointer-events-none opacity-80"
                  />
                )}
                <div className="absolute bottom-2 left-4 text-[10px] text-slate-600 font-mono">
                  X ____________________________________________________
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 text-[11px]">
                  Digital touch/stylus capture active
                </span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Pad</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="Type your full legal name..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />
              {/* Preview in cursive */}
              <div className="h-16 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center px-4">
                <span
                  style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '24px' }}
                  className="text-sky-400 select-none tracking-wide"
                >
                  {typedSignature || 'Signature Preview'}
                </span>
              </div>
            </div>
          )}

          {/* Security Challenge: PIN & Legal Attestation */}
          <div className="pt-3 border-t border-slate-800 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300 font-medium">Laboratory Authorization PIN:</span>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="PIN (e.g. 2026)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono tracking-widest text-center"
                />
              </div>

              <span className="text-[11px] text-slate-500 font-mono">
                Security: 21 CFR Part 11 Compliant Challenge
              </span>
            </div>
            {pinError && <div className="text-rose-400 text-[11px]">{pinError}</div>}

            {/* Legal Attestation Checkbox */}
            <label className="flex items-start space-x-2.5 text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={attestationAccepted}
                onChange={(e) => setAttestationAccepted(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-rose-500 focus:ring-0"
              />
              <span className="text-[11px] leading-relaxed text-slate-400">
                I hereby certify under penalty of administrative sanctions that I have personally reviewed the digital peripheral blood smear images for <strong className="text-white">{caseData.accessionNumber}</strong>, verified the morphological WBC differential, and authorize electronic release to the Laboratory Information System (LIS).
              </span>
            </label>
            {attestationError && <div className="text-rose-400 text-[11px] font-semibold">{attestationError}</div>}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-[11px] font-mono text-slate-500">
            Audit Trail: {caseData.technicianName} ({caseData.collectionTime})
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer transition-all"
            >
              Cancel
            </button>

            <button
              onClick={handleSignAndSubmit}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Electronic Signature & Sign Off</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
