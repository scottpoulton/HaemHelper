import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { CellaVisionWorkspace } from './components/CellaVisionWorkspace';
import { ClassifierView } from './components/ClassifierView';
import { TrainingStudioView } from './components/TrainingStudioView';
import { AugmentationsView } from './components/AugmentationsView';
import { ModelArchitectureView } from './components/ModelArchitectureView';
import { CELLAVISION_CLASSES } from './data/cellDefinitions';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('cellavision');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      <Header classesCount={Object.keys(CELLAVISION_CLASSES).length} />

      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'cellavision' && (
          <CellaVisionWorkspace device="wasm" />
        )}

        {activeTab === 'classifier' && (
          <ClassifierView
            device="wasm"
            onAddToDifferential={() => setActiveTab('cellavision')}
          />
        )}

        {activeTab === 'augmentations' && (
          <AugmentationsView />
        )}

        {activeTab === 'training' && (
          <TrainingStudioView device="mps" />
        )}

        {activeTab === 'architecture' && (
          <ModelArchitectureView />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            HaemHelper • Digital Peripheral Blood Smear Morphology & Differential Review
          </div>
          <div className="flex items-center space-x-3 text-slate-500 font-mono text-[11px]">
            <span>100-WBC Differential</span>
            <span>·</span>
            <span>RBC Morphology Grading</span>
            <span>·</span>
            <span>ONNX / ResNet-18</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;