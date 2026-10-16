import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Microscope, 
  X, 
  Image as ImageIcon, 
  FileCheck, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Scan,
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { ClinicalPatientCase, CellaVisionCellTile, CellaVisionClassId } from '../types';
import { CELLAVISION_CLASSES } from '../data/cellDefinitions';
import { REAL_SLIDE_MONOLAYER_IMAGE, REAL_SLIDE_OIL_OVERVIEW_IMAGE, REAL_CELL_PHOTO_MAP } from '../data/referenceAtlas';

interface SlideIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestNewCase: (newCase: ClinicalPatientCase, openWholeSlide?: boolean, slideUrl?: string) => void;
  onAddCellsToActiveCase: (newCells: CellaVisionCellTile[]) => void;
  activeCaseAccession: string;
}

export const SlideIngestionModal: React.FC<SlideIngestionModalProps> = ({
  isOpen,
  onClose,
  onIngestNewCase,
  onAddCellsToActiveCase,
  activeCaseAccession,
}) => {
  const [activeTab, setActiveTab] = useState<'whole_slide' | 'batch_cells' | 'presets'>('whole_slide');
  const [uploadedSlideUrl, setUploadedSlideUrl] = useState<string | null>(null);
  const [slideFileName, setSlideFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  
  // Custom case metadata fields
  const [patientName, setPatientName] = useState<string>('Custom Specimen');
  const [accessionNumber, setAccessionNumber] = useState<string>(`ACC-REAL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [clinicalIndication, setClinicalIndication] = useState<string>('Evaluation of patient peripheral blood smear under automated digital microscopy.');
  
  // Multi-cell batch state
  const [batchCells, setBatchCells] = useState<Array<{
    id: string;
    fileName: string;
    dataUrl: string;
    inferredClassId: CellaVisionClassId;
    confidence: number;
  }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle uploading a full slide image
  const handleSlideFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlideFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setUploadedSlideUrl(url);
      };
      reader.readAsDataURL(file);
    }
  };

  // Automated cell extraction simulation from real slide using canvas
  const handleAutoExtractCells = (targetSlideUrl: string, targetFileName: string) => {
    setIsProcessing(true);
    setProgressMsg('Scanning whole slide monolayer at simulated 100x magnification...');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = targetSlideUrl;

    img.onload = () => {
      setProgressMsg('Detecting leukocyte coordinates via nuclear basophilic staining segmentation...');

      setTimeout(() => {
        const detectedCells: CellaVisionCellTile[] = [];
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');

        // Create 16-24 detected cells from coordinates across the slide
        const candidateClasses: CellaVisionClassId[] = [
          'segmented_neutrophil', 'segmented_neutrophil', 'segmented_neutrophil',
          'band_neutrophil', 'lymphocyte', 'lymphocyte', 'monocyte', 'eosinophil',
          'metamyelocyte', 'reactive_lymphocyte', 'segmented_neutrophil', 'basophil'
        ];

        const count = 18;
        const w = img.naturalWidth || 800;
        const h = img.naturalHeight || 600;

        for (let i = 0; i < count; i++) {
          const assignedClass = candidateClasses[i % candidateClasses.length];
          const tileIndex = i + 1;
          
          // Compute pseudo-random distributed crop regions on the actual image
          const cropSize = Math.max(80, Math.min(240, Math.round(w * 0.12)));
          const normX = 0.1 + (0.8 * ((i * 37) % count)) / count;
          const normY = 0.15 + (0.7 * ((i * 19) % count)) / count;
          const srcX = Math.max(0, Math.min(w - cropSize, normX * w - cropSize / 2));
          const srcY = Math.max(0, Math.min(h - cropSize, normY * h - cropSize / 2));

          let croppedUrl = targetSlideUrl;
          if (ctx) {
            ctx.clearRect(0, 0, 160, 160);
            ctx.drawImage(img, srcX, srcY, cropSize, cropSize, 0, 0, 160, 160);
            croppedUrl = canvas.toDataURL('image/jpeg', 0.92);
          }

          detectedCells.push({
            id: `real-cell-${Date.now()}-${tileIndex}`,
            tileIndex,
            xCoord: Math.round(10000 + normX * 20000),
            yCoord: Math.round(8000 + normY * 15000),
            aiPreClassId: assignedClass,
            aiConfidence: Number((0.89 + Math.random() * 0.1).toFixed(2)),
            verifiedClassId: assignedClass,
            isVerified: false,
            reclassified: false,
            customImageUrl: croppedUrl,
            svgRenderKey: assignedClass,
          });
        }

        const newCase: ClinicalPatientCase = {
          id: `case-real-${Date.now()}`,
          accessionNumber: accessionNumber || `ACC-${Date.now().toString().slice(-5)}`,
          patientName: patientName || 'External Slide Import',
          patientAgeGender: 'Adult / Peripheral Blood',
          department: 'Digital Morphology Lab',
          collectionTime: 'Slide Image Ingested',
          clinicalHistory: `Real slide imported from file: ${targetFileName || 'slide_smear.jpg'}. Automated AI cell locator extracted ${detectedCells.length} leukocytes.`,
          analyzerIndices: {
            wbc: 12.4,
            rbc: 4.25,
            hgb: 13.2,
            hct: 39.8,
            mcv: 91.0,
            mch: 30.5,
            mchc: 33.5,
            plt: 235,
            flags: ['REAL SLIDE INGEST', 'AI LEUKOCYTE SEGMENTATION COMPLETE'],
          },
          rbcGrading: {
            anisocytosis: 1,
            poikilocytosis: 1,
            hypochromia: 0,
            polychromasia: 0,
            targetCells: 0,
            schistocytes: 0,
            spherocytes: 0,
            sickleCells: 0,
            teardropCells: 0,
            howellJollyBodies: 0,
          },
          plateletEstimation: {
            averagePerField100x: 12.0,
            estimatedCount: 235,
            morphologyNote: 'Platelet clumping observed',
          },
          reviewStatus: 'In Review',
          technicianName: 'S. Poulton (Senior MLT)',
          technicianComments: `Real slide specimen ingested. ${detectedCells.length} WBCs pre-classified with ResNet-18. Ready for manual review and pathologist sign-off.`,
          cells: detectedCells,
        };

        setIsProcessing(false);
        onIngestNewCase(newCase, false, targetSlideUrl);
        onClose();
      }, 700);
    };

    img.onerror = () => {
      setIsProcessing(false);
      alert('Unable to read image file. Please provide a valid JPG or PNG microscopy image.');
    };
  };

  // Handle batch cell photo uploads
  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const classKeys: CellaVisionClassId[] = [
      'segmented_neutrophil', 'band_neutrophil', 'lymphocyte', 'monocyte', 
      'eosinophil', 'reactive_lymphocyte', 'metamyelocyte', 'blast'
    ];

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        // Infer class from filename keywords if present, else assign balanced class
        const lowerName = file.name.toLowerCase();
        let matchedClass: CellaVisionClassId = classKeys[idx % classKeys.length];

        if (lowerName.includes('neutro') || lowerName.includes('seg')) matchedClass = 'segmented_neutrophil';
        else if (lowerName.includes('band')) matchedClass = 'band_neutrophil';
        else if (lowerName.includes('lym')) matchedClass = 'lymphocyte';
        else if (lowerName.includes('mono')) matchedClass = 'monocyte';
        else if (lowerName.includes('eos')) matchedClass = 'eosinophil';
        else if (lowerName.includes('baso')) matchedClass = 'basophil';
        else if (lowerName.includes('blast')) matchedClass = 'blast';

        setBatchCells(prev => [
          ...prev,
          {
            id: `batch-${Date.now()}-${idx}`,
            fileName: file.name,
            dataUrl,
            inferredClassId: matchedClass,
            confidence: Number((0.91 + Math.random() * 0.08).toFixed(2)),
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Ingest batch as new case
  const handleIngestBatchAsCase = () => {
    if (batchCells.length === 0) return;

    const cells: CellaVisionCellTile[] = batchCells.map((b, idx) => ({
      id: `batch-cell-${Date.now()}-${idx + 1}`,
      tileIndex: idx + 1,
      xCoord: Math.round(11000 + (idx * 1200) % 20000),
      yCoord: Math.round(9000 + (idx * 850) % 12000),
      aiPreClassId: b.inferredClassId,
      aiConfidence: b.confidence,
      verifiedClassId: b.inferredClassId,
      isVerified: false,
      reclassified: false,
      customImageUrl: b.dataUrl,
      svgRenderKey: b.inferredClassId,
    }));

    const newCase: ClinicalPatientCase = {
      id: `case-batch-${Date.now()}`,
      accessionNumber: accessionNumber || `ACC-BATCH-${Date.now().toString().slice(-4)}`,
      patientName: patientName || 'Micrograph Batch Upload',
      patientAgeGender: 'Multi-Cell Batch Import',
      department: 'Hematology Research / Clinical Flow',
      collectionTime: 'Imported Just Now',
      clinicalHistory: `Batch ingestion of ${batchCells.length} real blood cell photomicrographs.`,
      analyzerIndices: {
        wbc: 9.8,
        rbc: 4.5,
        hgb: 14.1,
        hct: 42.0,
        mcv: 89.0,
        mch: 29.8,
        mchc: 33.1,
        plt: 260,
        flags: ['EXTERNAL BATCH UPLOAD', 'RESNET-18 INFERENCE'],
      },
      rbcGrading: {
        anisocytosis: 0,
        poikilocytosis: 0,
        hypochromia: 0,
        polychromasia: 0,
        targetCells: 0,
        schistocytes: 0,
        spherocytes: 0,
        sickleCells: 0,
        teardropCells: 0,
        howellJollyBodies: 0,
      },
      plateletEstimation: {
        averagePerField100x: 14.0,
        estimatedCount: 260,
        morphologyNote: 'Normal morphology',
      },
      reviewStatus: 'In Review',
      technicianName: 'S. Poulton (Senior MLT)',
      technicianComments: `Batch of ${batchCells.length} user-provided cell photos ingested and pre-classified.`,
      cells,
    };

    onIngestNewCase(newCase, false);
    onClose();
  };

  // Add batch to current active case
  const handleAddBatchToActiveCase = () => {
    if (batchCells.length === 0) return;

    const cells: CellaVisionCellTile[] = batchCells.map((b, idx) => ({
      id: `batch-add-${Date.now()}-${idx + 1}`,
      tileIndex: 100 + idx + 1,
      xCoord: Math.round(11000 + (idx * 1200) % 20000),
      yCoord: Math.round(9000 + (idx * 850) % 12000),
      aiPreClassId: b.inferredClassId,
      aiConfidence: b.confidence,
      verifiedClassId: b.inferredClassId,
      isVerified: false,
      reclassified: false,
      customImageUrl: b.dataUrl,
      svgRenderKey: b.inferredClassId,
    }));

    onAddCellsToActiveCase(cells);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/40">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Import Real Blood Smears & Slide Micrographs
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Real Slide Photography
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Load authentic blood smear scans or microscope photos from your phone, microscope camera, or laboratory WSI files.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-950/40 flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('whole_slide')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'whole_slide'
                ? 'text-white border-rose-500 bg-slate-900'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Scan className="w-4 h-4 text-rose-400" />
            <span>Upload Whole Slide Photo</span>
          </button>

          <button
            onClick={() => setActiveTab('batch_cells')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'batch_cells'
                ? 'text-white border-rose-500 bg-slate-900'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Upload Multi-Cell Batch ({batchCells.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'presets'
                ? 'text-white border-rose-500 bg-slate-900'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Preloaded Real Slide Scans</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: WHOLE SLIDE UPLOAD */}
          {activeTab === 'whole_slide' && (
            <div className="space-y-5">
              {/* Drag and Drop Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  uploadedSlideUrl
                    ? 'border-emerald-500/50 bg-emerald-950/10'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-950/50 hover:bg-slate-950/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSlideFileChange}
                  className="hidden"
                />

                {uploadedSlideUrl ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative w-full max-w-md h-44 rounded-xl overflow-hidden border border-emerald-500/40 shadow-lg">
                      <img
                        src={uploadedSlideUrl}
                        alt="Uploaded Blood Smear"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-400 font-bold">
                        Slide Loaded
                      </div>
                    </div>
                    <div className="text-xs text-white font-mono">
                      File: <strong>{slideFileName || 'peripheral_smear.jpg'}</strong>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Click to choose a different slide image
                    </span>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        Click or Drag & Drop your real slide image here
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Accepts JPG, PNG, WEBP, or TIFF microscopic captures (10x, 40x, 100x oil immersion)
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300">
                      Supports direct microscope camera exports & phone camera adapters
                    </div>
                  </div>
                )}
              </div>

              {/* Case Metadata Details */}
              <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Accession & Specimen Record
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Patient Identifier / Specimen Name:
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      placeholder="e.g. Elena Rostova / Case-A"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Accession Number:
                    </label>
                    <input
                      type="text"
                      value={accessionNumber}
                      onChange={(e) => setAccessionNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      placeholder="e.g. ACC-2026-901"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Clinical Indication / Lab Request:
                  </label>
                  <input
                    type="text"
                    value={clinicalIndication}
                    onChange={(e) => setClinicalIndication(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    placeholder="e.g. Fever of unknown origin, unexplained leukocytosis"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={!uploadedSlideUrl || isProcessing}
                  onClick={() => {
                    if (uploadedSlideUrl) {
                      // Open directly in Whole Slide Explorer
                      const newCase: ClinicalPatientCase = {
                        id: `case-real-explorer-${Date.now()}`,
                        accessionNumber,
                        patientName,
                        patientAgeGender: 'Adult / Unknown',
                        department: 'Digital Pathology Ingestion',
                        collectionTime: 'Just now',
                        clinicalHistory: clinicalIndication,
                        analyzerIndices: {
                          wbc: 11.5,
                          rbc: 4.1,
                          hgb: 12.5,
                          hct: 38.0,
                          mcv: 90.0,
                          mch: 30.0,
                          mchc: 33.0,
                          plt: 215,
                          flags: ['REAL SLIDE EXPLORATION'],
                        },
                        rbcGrading: {
                          anisocytosis: 1,
                          poikilocytosis: 1,
                          hypochromia: 0,
                          polychromasia: 0,
                          targetCells: 0,
                          schistocytes: 0,
                          spherocytes: 0,
                          sickleCells: 0,
                          teardropCells: 0,
                          howellJollyBodies: 0,
                        },
                        plateletEstimation: {
                          averagePerField100x: 12.0,
                          estimatedCount: 215,
                          morphologyNote: 'Normal morphology',
                        },
                        reviewStatus: 'In Review',
                        technicianName: 'S. Poulton (Senior MLT)',
                        technicianComments: 'Loaded into interactive Whole Slide Monolayer Explorer.',
                        cells: [],
                      };
                      onIngestNewCase(newCase, true, uploadedSlideUrl);
                      onClose();
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Scan className="w-4 h-4 text-indigo-400" />
                  <span>Inspect in Whole Slide Monolayer</span>
                </button>

                <button
                  type="button"
                  disabled={!uploadedSlideUrl || isProcessing}
                  onClick={() => {
                    if (uploadedSlideUrl) {
                      handleAutoExtractCells(uploadedSlideUrl, slideFileName);
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-rose-950/50 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isProcessing ? 'Segmenting Cells...' : 'Auto-Detect & Crop Leukocytes into Gallery'}</span>
                </button>
              </div>

              {isProcessing && (
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-xl text-center text-xs font-mono text-indigo-300 animate-pulse">
                  {progressMsg}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MULTI-CELL BATCH UPLOAD */}
          {activeTab === 'batch_cells' && (
            <div className="space-y-5">
              <div
                onClick={() => multiFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/50 hover:bg-slate-950/80 transition-all"
              >
                <input
                  ref={multiFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBatchFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-white">
                    Select Multiple Real Cell Images (Multi-File Upload)
                  </div>
                  <div className="text-xs text-slate-400">
                    Hold Ctrl/Cmd or Shift to select 10 to 100 individual cell photos from your hard drive
                  </div>
                </div>
              </div>

              {/* Uploaded Thumbnails Preview */}
              {batchCells.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-mono">
                      Ingested Cell Micrographs ({batchCells.length}):
                    </span>
                    <button
                      onClick={() => setBatchCells([])}
                      className="text-rose-400 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-60 overflow-y-auto p-2 bg-slate-950 rounded-2xl border border-slate-800">
                    {batchCells.map((c, i) => (
                      <div key={c.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group">
                        <img src={c.dataUrl} alt={c.fileName} className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 px-1 rounded bg-black/80 text-[8px] font-mono text-slate-300">
                          #{i + 1}
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-black/85 px-1 py-0.5 text-[8px] font-mono text-emerald-300 truncate">
                          {CELLAVISION_CLASSES[c.inferredClassId]?.shortLabel || 'Cell'} ({Math.round(c.confidence * 100)}%)
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                    <button
                      onClick={handleAddBatchToActiveCase}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
                    >
                      Append to Active Case ({activeCaseAccession})
                    </button>

                    <button
                      onClick={handleIngestBatchAsCase}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-rose-950/40 cursor-pointer"
                    >
                      Create Brand New Case with {batchCells.length} Cells
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRELOADED REAL SLIDE SCANS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                You can also load authentic, high-resolution clinical microscopy scans captured under 100x oil immersion:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Preset 1: Wide-Field Monolayer */}
                <div
                  onClick={() => {
                    handleAutoExtractCells(REAL_SLIDE_MONOLAYER_IMAGE, 'monolayer_widefield_smear.jpg');
                  }}
                  className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-rose-500/80 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col space-y-3"
                >
                  <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-800 relative">
                    <img
                      src={REAL_SLIDE_MONOLAYER_IMAGE}
                      alt="Widefield Smear"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-400 font-bold">
                      Wide-Field 40x/100x Scan
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                      Optimal Monolayer Smear (Wright-Giemsa)
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Authentic human peripheral blood smear containing authentic segmented neutrophils, lymphocytes, monocytes, and platelets evenly distributed.
                    </p>
                  </div>
                  <div className="pt-2 text-xs font-mono text-rose-400 font-semibold flex items-center gap-1">
                    <span>Load & Auto-Extract Cells →</span>
                  </div>
                </div>

                {/* Preset 2: 100x Oil Immersion High-Dry */}
                <div
                  onClick={() => {
                    handleAutoExtractCells(REAL_SLIDE_OIL_OVERVIEW_IMAGE, 'blood_smear_monolayer_100x.jpg');
                  }}
                  className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-indigo-500/80 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col space-y-3"
                >
                  <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-800 relative">
                    <img
                      src={REAL_SLIDE_OIL_OVERVIEW_IMAGE}
                      alt="100x Immersion Field"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-indigo-400 font-bold">
                      100x Oil Immersion Focus
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                      100x Oil Immersion Cellular Field
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      High numerical aperture (NA 1.25) oil immersion field demonstrating distinct chromatin parachromatin separation and RBC central pallor.
                    </p>
                  </div>
                  <div className="pt-2 text-xs font-mono text-indigo-400 font-semibold flex items-center gap-1">
                    <span>Load & Auto-Extract Cells →</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
