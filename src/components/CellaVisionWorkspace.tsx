import React, { useState } from 'react';
import { ClinicalPatientCase, CellaVisionCellTile, CellaVisionClassId } from '../types';
import { INITIAL_CELLAVISION_CASES } from '../data/cellavisionCases';
import { CellaVisionGallery } from './CellaVisionGallery';
import { CellInspectorComparator } from './CellInspectorComparator';
import { RbcPlateletPanel } from './RbcPlateletPanel';
import { PathologyReportModal } from './PathologyReportModal';
import { SignOffModal } from './SignOffModal';
import { ReferenceAtlasPanel } from './ReferenceAtlasPanel';
import { WholeSlideExplorer } from './WholeSlideExplorer';
import { SlideIngestionModal } from './SlideIngestionModal';
import {
  Microscope,
  FileText,
  Disc,
  Upload,
  CheckCircle2,
  ClipboardCheck,
  BookOpen,
  Scan,
} from 'lucide-react';

interface CellaVisionWorkspaceProps {
  device: string;
}

export const CellaVisionWorkspace: React.FC<CellaVisionWorkspaceProps> = () => {
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

  const handleSignOff = (reviewerName: string, comments: string) => {
    setCases(prevCases =>
      prevCases.map(c => {
        if (c.id !== activeCase.id) return c;
        return {
          ...c,
          reviewStatus: 'Signed Off',
          pathologistName: reviewerName,
          pathologistComments: comments,
          signedOffAt: new Date().toLocaleTimeString(),
        };
      })
    );
    setIsReportOpen(false);
    setIsSignOffModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Case & Accession Bar */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-400 shrink-0">
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
                  className="bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm sm:text-base rounded-lg px-3 py-1.5 cursor-pointer focus:outline-none focus:border-rose-500"
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.accessionNumber} — {c.patientName} ({c.department})
                    </option>
                  ))}
                </select>

                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                    activeCase.reviewStatus === 'Signed Off'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {activeCase.reviewStatus}
                </span>
              </div>

              <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-2">
                <span>{activeCase.patientAgeGender}</span>
                <span>·</span>
                <span>Collected: {activeCase.collectionTime}</span>
                <span>·</span>
                <span>Bench Tech: {activeCase.technicianName}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsSlideModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-rose-400" />
              <span>Import Slide / Batch</span>
            </button>

            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Printable Report</span>
            </button>

            <button
              onClick={() => setIsSignOffModalOpen(true)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeCase.reviewStatus === 'Signed Off'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>
                {activeCase.reviewStatus === 'Signed Off' ? 'Completed • View Summary' : 'Complete Review'}
              </span>
            </button>
          </div>
        </div>

        {/* Review Completion Banner */}
        {activeCase.reviewStatus === 'Signed Off' && activeCase.signedOffAt && (
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Differential verified by <strong>{activeCase.pathologistName}</strong> at {activeCase.signedOffAt}
              </span>
            </div>
            <button
              onClick={() => setIsSignOffModalOpen(true)}
              className="text-slate-300 hover:text-white underline cursor-pointer text-xs text-left sm:text-right"
            >
              Edit Notes / Export Summary
            </button>
          </div>
        )}

        {/* Clinical Indication & CBC Analyzer Ribbon */}
        <div className="pt-3 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="text-slate-300 max-w-xl">
            <strong className="text-slate-200">Clinical Notes:</strong> {activeCase.clinicalHistory}
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
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px]"
              >
                {fl}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-view Switcher & Atlas Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubView('gallery')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSubView === 'gallery'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Microscope className="w-4 h-4" />
            <span>Leukocyte Gallery ({activeCase.cells.length} Cells)</span>
          </button>

          <button
            onClick={() => setActiveSubView('whole_slide')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSubView === 'whole_slide'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>Monolayer Scan</span>
          </button>

          <button
            onClick={() => setActiveSubView('rbc_plt')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSubView === 'rbc_plt'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Disc className="w-4 h-4" />
            <span>RBC & Platelet Grading</span>
          </button>
        </div>

        <button
          onClick={() => setIsAtlasPanelOpen(!isAtlasPanelOpen)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 border ${
            isAtlasPanelOpen
              ? 'bg-slate-800 text-white border-slate-600'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>{isAtlasPanelOpen ? 'Hide Reference Atlas' : 'Reference Atlas'}</span>
        </button>
      </div>

      {/* Main Workspace Stage */}
      {activeSubView === 'gallery' && (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 space-y-6 w-full">
            <CellInspectorComparator
              cell={selectedCell}
              onReclassify={handleReclassify}
              onVerify={handleVerifyCell}
              onNavigateNext={handleNavigateNext}
              onNavigatePrev={handleNavigatePrev}
            />

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

      <PathologyReportModal
        caseData={activeCase}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSignOff={handleSignOff}
      />

      <SignOffModal
        caseData={activeCase}
        isOpen={isSignOffModalOpen}
        onClose={() => setIsSignOffModalOpen(false)}
        onConfirmSignOff={({ reviewerName, reviewerComments }) =>
          handleSignOff(reviewerName, reviewerComments)
        }
      />

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
          setActiveSubView(openWholeSlide ? 'whole_slide' : 'gallery');
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