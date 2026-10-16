import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { CellaVisionWorkspace } from './components/CellaVisionWorkspace';
import { ClassifierView } from './components/ClassifierView';
import { TrainingStudioView } from './components/TrainingStudioView';
import { AugmentationsView } from './components/AugmentationsView';
import { ModelArchitectureView } from './components/ModelArchitectureView';
import { PyTorchSourceView } from './components/PyTorchSourceView';
import { HAEMATOLOGY_CLASSES } from './data/bloodCellsData';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('cellavision');
  const [device, setDevice] = useState<'mps' | 'cuda' | 'cpu'>('mps');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Header */}
      <Header
        device={device}
        onDeviceChange={setDevice}
        classesCount={HAEMATOLOGY_CLASSES.length}
      />

      {/* Navigation Sub-header */}
      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'cellavision' && (
          <CellaVisionWorkspace device={device} />
        )}

        {activeTab === 'classifier' && (
          <ClassifierView
            device={device}
            onAddToDifferential={() => setActiveTab('cellavision')}
          />
        )}

        {activeTab === 'training' && (
          <TrainingStudioView device={device} />
        )}

        {activeTab === 'augmentations' && (
          <AugmentationsView />
        )}

        {activeTab === 'architecture' && (
          <ModelArchitectureView />
        )}

        {activeTab === 'source' && (
          <PyTorchSourceView />
        )}
      </main>

      {/* Clinical Status Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            HaemHelper • CellaVision Digital Morphology & ResNet-18 Automated Hematology Workstation
          </div>
          <div className="flex items-center space-x-3 text-slate-500 font-mono text-[11px]">
            <span>100-WBC Pre-Classification</span>
            <span>·</span>
            <span>RBC Poikilocytosis Matrix</span>
            <span>·</span>
            <span>LIS Sign-Off Validation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
