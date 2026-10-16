import React, { useState } from 'react';
import { ClinicalPatientCase, CellaVisionCellTile, CellaVisionClassId } from '../types';
import { INITIAL_CELLAVISION_CASES } from '../data/cellavisionCases';
import { CELLAVISION_CLASSES } from '../data/cellDefinitions';
import { CellaVisionGallery } from './CellaVisionGallery';
import { CellInspectorComparator } from './CellInspectorComparator';
import { RbcPlateletPanel } from './RbcPlateletPanel';
import { PathologyReportModal } from './PathologyReportModal';
import { SignOffModal } from './SignOffModal';
import { ReferenceAtlasPanel } from './ReferenceAtlasPanel';
import { WholeSlideExplorer } from './WholeSlideExplorer';
import { SlideIngestionModal } from './SlideIngestionModal';
import { Microscope, FileText, Disc, Upload, CheckCircle, ChevronDown, User, Activity, AlertTriangle, PenTool, ShieldCheck, FileCheck, BookOpen, Scan, PlusCircle } from 'lucide-react';

interface CellaVisionWorkspaceProps {
  device: string;
}

export const CellaVisionWorkspace: React.FC<CellaVisionWorkspaceProps> = ({ device }) => {
  const [cases, setCases] = useState<ClinicalPatientCase[]>(INITIAL_CELLAVISION_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string>(INITIAL_CELLAVISION_CASES[0].id);
  const [activeSubView, setActiveSubView] = useState<'gallery' | 'whole_slide' | 'rbc_plt'>('gallery');
  const [selectedCellId, setSelectedCellId] = useState<string | null>(
    INITIAL_CELLAVISION_CASES[0].cells[0]?.id || null
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState<boolean>(false);
  const [isAtlasPanelOpen, setIsAtlasPanelOpen] = useState<boolean>(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState<boolean>(false);
  const [customSlideUrl, setCustomSlideUrl] = useState<string | undefined>(undefined);

  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0];
  const selectedCell = activeCase.cells.find(c => c.id === selectedCellId) || activeCase.cells[0] || null;

  // Handle reclassification
  const handleReclassify = (cellId: string, newClassId: CellaVisionClassId) => {
    setCases(prevCases =>
      prevCases.map(c => {
        if (c.id !== activeCase.id) return c;
        return {
          ...c,
          cells: c.cells.map(cell => {
            if (cell.id !== cellId) return cell;
            return {
              ...cell,
              verifiedClassId: newClassId,
              isVerified: true,
              reclassified: newClassId !== cell.aiPreClassId,
            };
          }),
        };
      })
    );
  };

  // Handle single cell verification
  const handleVerifyCell = (cellId: string) => {
    setCases(prevCases =>
      prevCases.map(c => {
        if (c.id !== activeCase.id) return c;
        return {
          ...c,
          cells: c.cells.map(cell => (cell.id === cellId ? { ...cell, isVerified: true } : cell)),
        };
      })
    );
  };

  // Handle batch verify group
  const handleVerifyGroup = (classId: CellaVisionClassId) => {
    setCases(prevCases =>
      prevCases.map(c => {
        if (c.id !== activeCase.id) return c;
        return {
          ...c,
          cells: c.cells.map(cell =>
            cell.verifiedClassId === classId ? { ...cell, isVerified: true } : cell
          ),
        };
      })
    );
  };

  // Navigation handlers
  const handleNavigateNext = () => {
    const currentIndex = activeCase.cells.findIndex(c => c.id === selectedCellId);
    if (currentIndex >= 0 && currentIndex < activeCase.cells.length - 1) {
      setSelectedCellId(activeCase.cells[currentIndex + 1].id);
    }
  };

  const handleNavigatePrev = () => {
    const currentIndex = activeCase.cells.findIndex(c => c.id === selectedCellId);
    if (currentIndex > 0) {
      setSelectedCellId(activeCase.cells[currentIndex - 1].id);
    }
  };

  // Handle custom multi-cell upload
  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        // Create 12 custom cell crops simulating automated cell detection from the uploaded slide
        const newCells: CellaVisionCellTile[] = Array.from({ length: 12 }).map((_, i) => {
          const classKeys: CellaVisionClassId[] = [
            'segmented_neutrophil', 'band_neutrophil', 'lymphocyte', 'monocyte', 'eosinophil', 'reactive_lymphocyte'
          ];
          const assignedClass = classKeys[i % classKeys.length];
          return {
            id: `custom-cell-${i + 1}`,
            tileIndex: i + 1,
            xCoord: Math.round(10000 + i * 1500),
            yCoord: Math.round(12000 + (i % 3) * 2000),
            aiPreClassId: assignedClass,
            aiConfidence: Number((0.88 + Math.random() * 0.1).toFixed(2)),
            verifiedClassId: assignedClass,
            isVerified: false,
            reclassified: false,
            customImageUrl: imageUrl,
            svgRenderKey: assignedClass,
          };
        });

        const newCustomCase: ClinicalPatientCase = {
          id: `case-custom-${Date.now()}`,
          accessionNumber: `ACC-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`,
          patientName: 'External Smear Import',
          patientAgeGender: 'Adult / Unknown',
          department: 'Digital Pathology Ingestion',
          collectionTime: 'Just now',
          clinicalHistory: `Multi-cell automated detection performed on uploaded slide: ${file.name}.`,
          analyzerIndices: {
            wbc: 11.2,
            rbc: 4.1,
            hgb: 12.8,
            hct: 38.5,
            mcv: 90.2,
            mch: 30.1,
            mchc: 33.2,
            plt: 210,
            flags: ['UPLOADED SAMPLE', 'AI SCAN COMPLETE'],
          },
          cells: newCells,
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
            averagePerField100x: 14.0,
            estimatedCount: 210,
            morphologyNote: 'Normal morphology',
          },
          reviewStatus: 'In Review',
          technicianName: 'S. Poulton (Senior MLT)',
          technicianComments: 'Custom slide import. Automated leukocyte location and pre-classification completed.',
        };

        setCustomSlideUrl(imageUrl);
        setCases(prev => [newCustomCase, ...prev]);
        setActiveCaseId(newCustomCase.id);
        setSelectedCellId(newCells[0].id);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSlideFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setCustomSlideUrl(url);
      setActiveSubView('whole_slide');
    };
    reader.readAsDataURL(file);
  };

  const handleAddCellFromSlide = (newCell: CellaVisionCellTile) => {
    setCases(prevCases =>
      prevCases.map(c => {
        if (c.id !== activeCase.id) return c;
        return {
          ...c,
          cells: [newCell, ...c.cells],
        };
      })
    );
    setSelectedCellId(newCell.id);
  };

  const handleSignOff = (pathologistName: string, comments: string) => {
    setCases(prevCases =>
      prevCases.map(c => {
        if (c.id !== activeCase.id) return c;
        return {
          ...c,
          reviewStatus: 'Signed Off',
          pathologistName,
          pathologistComments: comments,
          signedOffAt: new Date().toLocaleTimeString(),
        };
      })
    );
    setIsReportOpen(false);
  };

  const handleConfirmSignOff = (data: {
    pathologistName: string;
    pathologistLicense: string;
    pathologistComments: string;
    electronicSignature: string;
    signatureHash: string;
  }) => {
    setCases(prevCases =>
      prevCases.map(c => {
        if (c.id !== activeCase.id) return c;
        return {
          ...c,
          reviewStatus: 'Signed Off',
          pathologistName: data.pathologistName,
          pathologistLicense: data.pathologistLicense,
          pathologistComments: data.pathologistComments,
          electronicSignature: data.electronicSignature,
          signatureHash: data.signatureHash,
          signedOffAt: new Date().toLocaleTimeString(),
        };
      })
    );
    setIsSignOffModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* CellaVision Top Accession & Patient Case Header */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Case Accession Selector */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-950/40 shrink-0">
              <Microscope className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <select
                  value={activeCaseId}
                  onChange={(e) => {
                    const chosen = cases.find(c => c.id === e.target.value) || cases[0];
                    setActiveCaseId(chosen.id);
                    setSelectedCellId(chosen.cells[0]?.id || null);
                  }}
                  className="bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm sm:text-base rounded-xl px-3 py-1 cursor-pointer focus:ring-1 focus:ring-rose-500"
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.accessionNumber} — {c.patientName} ({c.department})
                    </option>
                  ))}
                </select>

                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                  activeCase.reviewStatus === 'Signed Off'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {activeCase.reviewStatus}
                </span>
              </div>

              <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-2">
                <span>{activeCase.patientAgeGender}</span>
                <span>·</span>
                <span>Collected: {activeCase.collectionTime}</span>
                <span>·</span>
                <span>Tech: {activeCase.technicianName}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsSlideModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-rose-950/40 cursor-pointer transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Real Slide / Batch</span>
            </button>

            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full LIS Report</span>
            </button>

            <button
              onClick={() => setIsSignOffModalOpen(true)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer ${
                activeCase.reviewStatus === 'Signed Off'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                  : 'bg-gradient-to-r from-rose-600 via-crimson-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-rose-950/40'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{activeCase.reviewStatus === 'Signed Off' ? 'Signed Off • View Signature' : 'Sign-Off Case'}</span>
            </button>
          </div>
        </div>

        {/* Electronic Signature Certificate Banner when Signed Off */}
        {activeCase.reviewStatus === 'Signed Off' && activeCase.signedOffAt && (
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Certified Electronic Sign-Off by <strong>{activeCase.pathologistName}</strong> ({activeCase.pathologistLicense || 'Certified Hematopathologist'}) at {activeCase.signedOffAt}
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-400 flex items-center space-x-2 shrink-0">
              <span className="text-emerald-400/80">{activeCase.signatureHash || 'SHA256:VERIFIED'}</span>
              <button
                onClick={() => setIsSignOffModalOpen(true)}
                className="text-white hover:text-emerald-300 underline font-sans cursor-pointer text-xs"
              >
                Inspect Signature
              </button>
            </div>
          </div>
        )}

        {/* Patient Clinical Indication & CBC Analyzer Ribbon */}
        <div className="pt-3 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="text-slate-300 max-w-xl">
            <strong className="text-slate-200">Indication:</strong> {activeCase.clinicalHistory}
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="text-slate-500 text-[11px]">CBC:</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200">
              WBC: <strong className="text-white">{activeCase.analyzerIndices.wbc}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200">
              RBC: <strong className="text-white">{activeCase.analyzerIndices.rbc}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200">
              Hgb: <strong className="text-white">{activeCase.analyzerIndices.hgb}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200">
              Plt: <strong className="text-white">{activeCase.analyzerIndices.plt}</strong>
            </span>
            {activeCase.analyzerIndices.flags.slice(0, 2).map((fl, idx) => (
              <span key={idx} className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px]">
                {fl}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-view switcher tabs & Atlas Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubView('gallery')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSubView === 'gallery'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Microscope className="w-4 h-4" />
            <span>Leukocyte Gallery ({activeCase.cells.length} Cells)</span>
          </button>

          <button
            onClick={() => setActiveSubView('whole_slide')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSubView === 'whole_slide'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>Whole Slide Monolayer (Real Slide Photo)</span>
          </button>

          <button
            onClick={() => setActiveSubView('rbc_plt')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSubView === 'rbc_plt'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Disc className="w-4 h-4" />
            <span>RBC Morphology & Platelet Estimation</span>
          </button>
        </div>

        {/* Reference Atlas Side-Panel Toggle */}
        <button
          onClick={() => setIsAtlasPanelOpen(!isAtlasPanelOpen)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 border ${
            isAtlasPanelOpen
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
          <span>{isAtlasPanelOpen ? 'Hide Reference Atlas' : 'Open Reference Atlas'}</span>
        </button>
      </div>

      {/* Main Workspace Stage */}
      {activeSubView === 'gallery' && (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 space-y-6 w-full">
            {/* Active Cell High-Mag Inspector & Reference Comparator */}
            <CellInspectorComparator
              cell={selectedCell}
              onReclassify={handleReclassify}
              onVerify={handleVerifyCell}
              onNavigateNext={handleNavigateNext}
              onNavigatePrev={handleNavigatePrev}
            />

            {/* CellaVision Pre-Classification Gallery Grid with Sort and Drag-and-Drop */}
            <CellaVisionGallery
              cells={activeCase.cells}
              selectedCellId={selectedCellId}
              onSelectCell={setSelectedCellId}
              onVerifyGroup={handleVerifyGroup}
              filterCategory={filterCategory}
              onFilterChange={setFilterCategory}
              onReclassify={handleReclassify}
            />
          </div>

          {/* Reference Atlas Side-Panel */}
          {isAtlasPanelOpen && (
            <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-20">
              <ReferenceAtlasPanel
                isOpen={isAtlasPanelOpen}
                onClose={() => setIsAtlasPanelOpen(false)}
                selectedCellClassId={selectedCell?.verifiedClassId}
                onSelectCompareClass={(classId) => {
                  if (selectedCell) {
                    handleReclassify(selectedCell.id, classId);
                  }
                }}
                onQuickReclassifySelected={(classId) => {
                  if (selectedCell) {
                    handleReclassify(selectedCell.id, classId);
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Whole Slide Monolayer Explorer (Real Slide Photomicrography) */}
      {activeSubView === 'whole_slide' && (
        <WholeSlideExplorer
          customSlideUrl={customSlideUrl}
          onUploadSlide={handleUploadSlideFile}
          onAddCellFromSlide={handleAddCellFromSlide}
          existingCellsCount={activeCase.cells.length}
        />
      )}

      {activeSubView === 'rbc_plt' && (
        <RbcPlateletPanel
          rbcGrading={activeCase.rbcGrading}
          onUpdateRbcGrading={(newGrading) => {
            setCases(prev =>
              prev.map(c => (c.id === activeCase.id ? { ...c, rbcGrading: newGrading } : c))
            );
          }}
          plateletEstimation={activeCase.plateletEstimation}
          onUpdatePlateletEstimation={(newEst) => {
            setCases(prev =>
              prev.map(c => (c.id === activeCase.id ? { ...c, plateletEstimation: newEst } : c))
            );
          }}
          analyzerIndices={activeCase.analyzerIndices}
        />
      )}

      {/* Pathology Validation & Sign-Off Report Modal */}
      <PathologyReportModal
        caseData={activeCase}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSignOff={handleSignOff}
      />

      {/* Dedicated Pathologist Electronic Sign-Off Modal */}
      <SignOffModal
        caseData={activeCase}
        isOpen={isSignOffModalOpen}
        onClose={() => setIsSignOffModalOpen(false)}
        onConfirmSignOff={handleConfirmSignOff}
      />

      {/* Real Slide & Multi-Cell Batch Ingestion Modal */}
      <SlideIngestionModal
        isOpen={isSlideModalOpen}
        onClose={() => setIsSlideModalOpen(false)}
        onIngestNewCase={(newCase, openWholeSlide, slideUrl) => {
          setCases(prev => [newCase, ...prev]);
          setActiveCaseId(newCase.id);
          if (newCase.cells.length > 0) {
            setSelectedCellId(newCase.cells[0].id);
          }
          if (slideUrl) {
            setCustomSlideUrl(slideUrl);
          }
          if (openWholeSlide) {
            setActiveSubView('whole_slide');
          } else {
            setActiveSubView('gallery');
          }
        }}
        onAddCellsToActiveCase={(newCells) => {
          setCases(prev =>
            prev.map(c => {
              if (c.id !== activeCase.id) return c;
              return {
                ...c,
                cells: [...newCells, ...c.cells],
              };
            })
          );
          if (newCells.length > 0) {
            setSelectedCellId(newCells[0].id);
          }
          setActiveSubView('gallery');
        }}
        activeCaseAccession={activeCase.accessionNumber}
      />
    </div>
  );
};
