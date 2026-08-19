import React from 'react';
import type { ConfigState, ArrangementPattern } from '../types/configurator';
import { Grid, Sparkles, Compass, ShieldCheck } from 'lucide-react';

interface PatternSelectorProps {
  config: ConfigState;
  onChange: (updated: Partial<ConfigState>) => void;
  onOpenZeroCutGenerator?: () => void;
}

interface HerringboneOption {
  id: ArrangementPattern;
  name: string;
  subtitle: string;
  wasteRecommended: number;
  badge: string;
  svgIcon: React.ReactNode;
}

export const HERRINGBONE_OPTIONS: HerringboneOption[] = [
  {
    id: 'herringbone-90',
    name: 'Herringbone / Brăduț Clasic 90°',
    subtitle: 'Model țesut întrepătruns la 90 de grade. Ideal pentru alei înguste de 120×600 cm și terase.',
    wasteRecommended: 10,
    badge: 'MODEL PRINCIPAL',
    svgIcon: (
      <svg className="w-9 h-9 text-amber-400" viewBox="0 0 40 40" fill="currentColor">
        <rect x="4" y="6" width="16" height="6" rx="0.5" transform="rotate(45 12 9)" />
        <rect x="18" y="6" width="16" height="6" rx="0.5" transform="rotate(-45 26 9)" />
        <rect x="4" y="20" width="16" height="6" rx="0.5" transform="rotate(45 12 23)" />
        <rect x="18" y="20" width="16" height="6" rx="0.5" transform="rotate(-45 26 23)" />
      </svg>
    ),
  },
  {
    id: 'herringbone-45',
    name: 'Herringbone / Brăduț Diagonal 45°',
    subtitle: 'Dispunere dinamică la 45° pentru linii vizuale diagonale spectaculoase.',
    wasteRecommended: 15,
    badge: 'DIAGONAL',
    svgIcon: (
      <svg className="w-9 h-9 text-sky-400" viewBox="0 0 40 40" fill="currentColor">
        <rect x="8" y="4" width="18" height="6" rx="0.5" transform="rotate(45 17 7)" />
        <rect x="18" y="14" width="18" height="6" rx="0.5" transform="rotate(-45 27 17)" />
      </svg>
    ),
  },
];

export const PatternSelector: React.FC<PatternSelectorProps> = ({ config, onChange, onOpenZeroCutGenerator }) => {
  const handleSelectPattern = (opt: HerringboneOption) => {
    onChange({
      pattern: opt.id,
      surface: {
        ...config.surface,
        wasteFactor: opt.wasteRecommended,
      },
    });
  };

  return (
    <div className="space-y-5 bg-slate-900/80 p-5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg text-slate-100">
      {/* Zero-Cut Generator Banner */}
      {onOpenZeroCutGenerator && (
        <div className="p-3 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-sky-950/80 border border-emerald-500/40 rounded-xl flex items-center justify-between shadow-lg">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Optimizator Fără Tăieturi (Zero-Cut)
            </h4>
            <p className="text-[10px] text-slate-300">
              Calculează dimensiuni ideale de 120×600 cm fără pierderi sau goluri
            </p>
          </div>
          <button
            onClick={onOpenZeroCutGenerator}
            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-md whitespace-nowrap"
          >
            ⚡ Optimizare Montaj
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-semibold text-base flex items-center gap-2 text-amber-400">
          <Grid className="w-4.5 h-4.5" />
          <span>Configurator Model Brăduț</span>
        </h3>
        <span className="text-[11px] bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-md font-medium border border-amber-500/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Dale Beton 60×20 cm
        </span>
      </div>

      {/* Herringbone Options */}
      <div className="space-y-3">
        {HERRINGBONE_OPTIONS.map((opt) => {
          const isSelected = config.pattern === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelectPattern(opt)}
              className={`relative flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 w-full group ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 group-hover:border-slate-700">
                {opt.svgIcon}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-white group-hover:text-amber-300 flex items-center gap-2">
                    <span>{opt.name}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </h4>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                    {opt.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {opt.subtitle}
                </p>
                <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span>Pierderi: ~+{opt.wasteRecommended}%</span>
                  <span>•</span>
                  <span>Montaj Întrepătruns</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Border Minimization Strategy */}
      <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Minimizare Tăieturi la Margine
        </label>
        <p className="text-[11px] text-slate-400">
          Aliniați originea montajului pentru a minimiza ajustarea dalelor de pe contur.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <button
            onClick={() => onChange({ borderAlignment: 'straight-edge' })}
            className={`px-3 py-2 rounded-lg border font-medium text-left transition flex items-center justify-between ${
              config.borderAlignment === 'straight-edge'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span>Origine Margine Dreaptă</span>
            {config.borderAlignment === 'straight-edge' && (
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                MIN TĂIETURI
              </span>
            )}
          </button>
          <button
            onClick={() => onChange({ borderAlignment: 'centered' })}
            className={`px-3 py-2 rounded-lg border font-medium text-left transition flex items-center justify-between ${
              config.borderAlignment === 'centered'
                ? 'bg-sky-500/15 border-sky-500 text-sky-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span>Simetrie Centrată</span>
            {config.borderAlignment === 'centered' && (
              <span className="text-[10px] font-mono bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">
                CENTRAT
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Pattern Angle Controls */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex justify-between items-center text-xs">
          <label className="font-medium text-slate-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            Unghi Fin de Rotație
          </label>
          <span className="font-mono text-amber-400 font-semibold">
            {config.patternAngle}°
          </span>
        </div>
        <div className="flex gap-2 text-xs">
          {[0, 15, 30, 45, 90].map((deg) => (
            <button
              key={deg}
              onClick={() => onChange({ patternAngle: deg })}
              className={`flex-1 py-1.5 rounded-lg border text-center font-mono text-xs transition ${
                config.patternAngle === deg
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
