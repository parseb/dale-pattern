import React from 'react';
import { Package, Scissors, ShieldAlert, CheckCircle2, Sparkles } from 'lucide-react';
import type { BOMResult } from '../types/configurator';

interface KeyMetricsSummaryPanelProps {
  bom: BOMResult;
  wasteFactor: number;
}

export const KeyMetricsSummaryPanel: React.FC<KeyMetricsSummaryPanelProps> = ({ bom, wasteFactor }) => {
  const isZeroCut = bom.cutTileCount === 0;

  return (
    <div className="bg-slate-900/95 border-2 border-sky-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <h4 className="text-xs uppercase tracking-wider font-bold text-sky-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Sumar Execuție Montaj & Pierderi</span>
        </h4>
        {isZeroCut ? (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-3 py-1 rounded-full font-bold font-mono flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            0 TĂIETURI • MONTAJ PERFECT
          </span>
        ) : (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-1 rounded-full font-mono font-medium">
            Tăieturi Modularizate per Treimi
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* 1. NUMBER OF TILES USED */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>DALE UTILIZATE</span>
            <Package className="w-4 h-4 text-sky-400" />
          </div>
          <div className="my-1.5">
            <div className="text-2xl lg:text-3xl font-extrabold font-mono text-white tracking-tight">
              {bom.totalTilesNeeded}
              <span className="text-xs font-semibold text-sky-400 ml-1">buc</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {bom.fullTileCount} întregi + {bom.cutTileCount} bucăți
            </div>
          </div>
        </div>

        {/* 2. NUMBER OF CUTS NEEDED */}
        <div className={`p-3.5 rounded-lg border flex flex-col justify-between ${
          isZeroCut 
            ? 'bg-emerald-950/40 border-emerald-500/50' 
            : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>TĂIETURI NECESARE</span>
            <Scissors className={`w-4 h-4 ${isZeroCut ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div className="my-1.5">
            <div className={`text-2xl lg:text-3xl font-extrabold font-mono tracking-tight ${
              isZeroCut ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {bom.physicalCutsCount}
              <span className="text-xs font-semibold text-slate-400 ml-1">tăieturi</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isZeroCut ? 'Fără tăieturi necesare!' : `${bom.parentPaversCut} dale debitate (${bom.recycledCutPlanksSaved} salvate)`}
            </div>
          </div>
        </div>

        {/* 3. WASTE & BUFFER */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>PIERDERI & REZERVI</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-1.5">
            <div className="text-2xl lg:text-3xl font-extrabold font-mono text-purple-300 tracking-tight">
              +{wasteFactor}%
              <span className="text-xs font-semibold text-slate-400 ml-1.5">({bom.wasteTileCount} buc)</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Rezervă sparturi & tăieturi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
