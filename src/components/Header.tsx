import React from 'react';
import { Microscope, Layers, Keyboard } from 'lucide-react';

interface HeaderProps {
  classesCount: number;
}

export const Header: React.FC<HeaderProps> = ({ classesCount }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center border border-rose-500/40">
            <Microscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                HaemHelper
              </h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Digital Morphology & ResNet-18
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Peripheral Blood Smear Differential Workstation & Classification Pipeline
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-2.5 text-xs">
          <div className="hidden md:flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 font-mono">
            <Keyboard className="w-3.5 h-3.5 text-slate-400" />
            <span>Hotkeys: S B T Y P X L R M E A</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono">{classesCount} Lineages</span>
          </div>
        </div>
      </div>
    </header>
  );
};