import React from 'react';
import { Microscope, PlayCircle, SlidersHorizontal, Cpu, Scan } from 'lucide-react';

export type TabId = 'cellavision' | 'classifier' | 'training' | 'augmentations' | 'architecture';

interface NavigationProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const tabs: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
    {
      id: 'cellavision',
      label: 'Differential Workstation',
      icon: Scan,
    },
    {
      id: 'classifier',
      label: 'Single-Cell Classifier',
      icon: Microscope,
    },
    {
      id: 'augmentations',
      label: 'Stain & Augmentation Pipeline',
      icon: SlidersHorizontal,
    },
    {
      id: 'training',
      label: 'Training Telemetry',
      icon: PlayCircle,
    },
    {
      id: 'architecture',
      label: 'ResNet-18 Architecture',
      icon: Cpu,
    },
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};