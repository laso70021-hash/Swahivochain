import React from 'react';
import { Package } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#070d18] flex flex-col items-center justify-center text-white space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00e5c9] to-[#0077b6] flex items-center justify-center animate-pulse shadow-xl shadow-teal-500/20">
        <Package className="w-6 h-6 text-[#070d18] stroke-[2.5]" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-bold tracking-tight">Loading Logistics Portal...</p>
        <p className="text-xs text-slate-400 font-mono">Initializing private tenant session</p>
      </div>
    </div>
  );
}
