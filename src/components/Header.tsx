import React from 'react';
import { Activity, Cpu, Sparkles, Database, Layers } from 'lucide-react';

interface HeaderProps {
  device: string;
  onDeviceChange: (device: 'mps' | 'cuda' | 'cpu') => void;
  classesCount: number;
}

export const Header: React.FC<HeaderProps> = ({ device, onDeviceChange, classesCount }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-crimson-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-950/40 border border-rose-400/30">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                HaemHelper
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30">
                  ResNet18 Pipeline
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Peripheral Blood Smear Morphological Classification & PyTorch Suite
            </p>
          </div>
        </div>

        {/* Status badges & Device selector */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Classes: <strong className="text-white font-mono">{classesCount} Cell Types</strong></span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700/80 rounded-lg p-1 text-xs">
            <Cpu className="w-3.5 h-3.5 text-indigo-400 ml-1.5 hidden sm:inline" />
            <span className="text-slate-400 text-xs hidden sm:inline mr-1">Device:</span>
            <button
              onClick={() => onDeviceChange('mps')}
              title="Apple Silicon Metal Performance Shaders (High-speed local GPU)"
              className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${
                device === 'mps'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MPS
            </button>
            <button
              onClick={() => onDeviceChange('cuda')}
              title="NVIDIA CUDA Acceleration"
              className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${
                device === 'cuda'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CUDA
            </button>
            <button
              onClick={() => onDeviceChange('cpu')}
              title="CPU Fallback"
              className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${
                device === 'cpu'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CPU
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
