import React, { useState } from 'react';
import type { ConfigState, SurfaceDimensions } from '../types/configurator';
import {
  generateZeroCutSurfaceDimensions,
  searchZeroCutWeavePatterns,
} from '../utils/patternGenerator';
import type { ZeroCutWeaveMatch } from '../utils/patternGenerator';
import { Sparkles, CheckCircle2, X, Grid, Lock, ArrowRight, Scissors, RefreshCw } from 'lucide-react';

interface ZeroCutWeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConfigState;
  onApply: (updated: Partial<ConfigState>) => void;
}

export const ZeroCutWeaveModal: React.FC<ZeroCutWeaveModalProps> = ({
  isOpen,
  onClose,
  config,
  onApply,
}) => {
  if (!isOpen) return null;

  const [targetArea, setTargetArea] = useState<number>(config.surface.totalArea || 15);

  // 1. Calculate ideal zero-cut rectangular surface dimensions
  const zeroCutSurface = generateZeroCutSurfaceDimensions(targetArea, config.tile);

  const testSurface: SurfaceDimensions = {
    ...config.surface,
    shape: 'rectangle',
    width: zeroCutSurface.width,
    length: zeroCutSurface.length,
    totalArea: zeroCutSurface.totalArea,
    wasteFactor: 0,
  };

  // 2. Search for weaving patterns and compute minimal cut reuse metrics
  const searchResults: ZeroCutWeaveMatch[] = searchZeroCutWeavePatterns(config.tile, testSurface);
  const zeroCutMatches = searchResults.filter((m) => m.isZeroCut);

  const handleApplyMatch = (match: ZeroCutWeaveMatch) => {
    onApply({
      surface: testSurface,
      pattern: match.pattern,
      patternAngle: match.patternAngle,
      borderAlignment: 'straight-edge',
      lockToTileMultiples: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-sky-950/50 via-slate-900 to-emerald-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Optimizator Montaj Brăduț & Tăieri Minimizate
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                  1 Dală (60×20 cm) = 3 Module Pătrate (20×20 cm)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Minimizare tăieturi & Reutilizare piese perimetrale pentru suprafață ({config.tile.length}×{config.tile.width} cm)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Target Surface Coverage Slider */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-slate-300 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                Suprafață Țintă Dorită
              </label>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                ~{targetArea} m²
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="1"
              value={targetArea}
              onChange={(e) => setTargetArea(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono">
              <span>Suprafață Dreptunghiulară Ajustată:</span>
              <span className="text-white font-semibold">
                {zeroCutSurface.width}m × {zeroCutSurface.length}m ({zeroCutSurface.totalArea} m²)
              </span>
            </div>
          </div>

          {/* Weaving Results & Cut Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-emerald-400" />
                {zeroCutMatches.length > 0
                  ? `Modele Brăduț Fără Tăieturi (${zeroCutMatches.length} Găsite)`
                  : `Modele Brăduț - Necesită Tăieturi Optimizate (${searchResults.length} Opțiuni Analizate)`}
              </h3>
              <span className="text-[11px] text-sky-400 flex items-center gap-1 font-medium">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Reutilizare Piese Cut-off (Raport 3:1)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((match, idx) => (
                <div
                  key={`${match.pattern}-${match.patternAngle}-${idx}`}
                  className={`bg-slate-950 border rounded-xl p-4 flex flex-col justify-between transition group ${
                    match.isZeroCut
                      ? 'border-emerald-500/50 hover:border-emerald-400'
                      : 'border-slate-800 hover:border-sky-500/50'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm text-white group-hover:text-sky-300 transition">
                        {match.patternName}
                      </h4>
                      {match.isZeroCut ? (
                        <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 0 TĂIETURI
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                          <Scissors className="w-3 h-3 text-amber-400" /> {match.physicalCutsCount} TĂIETURI
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {match.isZeroCut
                        ? `Acoperă complet suprafața de ${zeroCutSurface.width}m × ${zeroCutSurface.length}m fără nicio tăietură sau pierdere.`
                        : `O dală (60×20 cm) este tăiată în 3 module pătrate (20×20 cm). Sunt necesare doar ${match.parentPaversCut} dale tăiate, salvând ${match.reusedPiecesCount} piese reutilizate.`}
                    </p>

                    {/* Detailed Metric Badges */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] font-mono">
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-500 block text-[10px]">DALE TĂIATE</span>
                        <strong className={match.isZeroCut ? 'text-emerald-400' : 'text-amber-400'}>
                          {match.parentPaversCut} buc
                        </strong>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-500 block text-[10px]">TĂIETURI FIZICE</span>
                        <strong className={match.isZeroCut ? 'text-emerald-400' : 'text-sky-400'}>
                          {match.physicalCutsCount} tăieri
                        </strong>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-500 block text-[10px]">PIESE REUTILIZATE</span>
                        <strong className="text-emerald-400">
                          +{match.reusedPiecesCount} economie
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-xs font-mono text-slate-300">
                      <span className="text-emerald-400 font-bold">{match.totalTiles}</span> dale totale
                    </div>
                    <button
                      onClick={() => handleApplyMatch(match)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <span>Aplică Modelul</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
};
