import React from 'react';
import { Microscope, PlayCircle, SlidersHorizontal, Cpu, FileSpreadsheet, Code2, Scan } from 'lucide-react';

export type TabId = 'cellavision' | 'classifier' | 'training' | 'augmentations' | 'architecture' | 'source';

interface NavigationProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    {
      id: 'cellavision' as TabId,
      label: 'CellaVision Workstation',
      icon: Scan,
      badge: 'Core Clinical',
    },
    {
      id: 'classifier' as TabId,
      label: 'Single-Slide HPF Classifier',
      icon: Microscope,
      badge: 'Inference',
    },
    {
      id: 'training' as TabId,
      label: 'PyTorch Training Studio',
      icon: PlayCircle,
      badge: 'ResNet18',
    },
    {
      id: 'augmentations' as TabId,
      label: 'Morphological Augmentation',
      icon: SlidersHorizontal,
      badge: 'Pipeline',
    },
    {
      id: 'architecture' as TabId,
      label: 'Model Architecture',
      icon: Cpu,
      badge: 'Graph',
    },
    {
      id: 'source' as TabId,
      label: 'PyTorch Source Code',
      icon: Code2,
      badge: '.py',
    },
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`hidden md:inline text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-rose-700/80 text-rose-100'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
