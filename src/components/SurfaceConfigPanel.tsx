import React from 'react';
import type { ConfigState, SurfaceShape } from '../types/configurator';
import { Maximize2, MoveHorizontal, MoveVertical, RotateCcw, LayoutGrid, Sparkles, ShieldCheck } from 'lucide-react';
import { optimizeSurfaceDimensionsForMinCut } from '../utils/patternGenerator';

interface SurfaceConfigPanelProps {
  config: ConfigState;
  onChange: (updated: Partial<ConfigState>) => void;
}

export const SurfaceConfigPanel: React.FC<SurfaceConfigPanelProps> = ({ config, onChange }) => {
  const { surface, tile } = config;

  const handleAreaSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetArea = Number(e.target.value);
    const w = Math.round(Math.sqrt(targetArea / 1.33) * 10) / 10;
    const l = Math.round((targetArea / w) * 10) / 10;
    
    onChange({
      surface: {
        ...surface,
        totalArea: targetArea,
        width: w,
        length: l,
      },
    });
  };

  const handleWidthChange = (val: number) => {
    const clamped = Math.max(1, Math.min(25, val));
    const w = Math.round(Math.round((clamped * 100) / 20) * 20) / 100;
    const area = Math.round(w * surface.length * 100) / 100;
    const shape: SurfaceShape = w === surface.length ? 'square' : 'rectangle';
    onChange({
      surface: {
        ...surface,
        width: w,
        shape,
        totalArea: Math.min(100, Math.max(5, area)),
      },
    });
  };

  const handleLengthChange = (val: number) => {
    const clamped = Math.max(1, Math.min(25, val));
    const l = Math.round(Math.round((clamped * 100) / 20) * 20) / 100;
    const area = Math.round(surface.width * l * 100) / 100;
    const shape: SurfaceShape = surface.width === l ? 'square' : 'rectangle';
    onChange({
      surface: {
        ...surface,
        length: l,
        shape,
        totalArea: Math.min(100, Math.max(5, area)),
      },
    });
  };

  const resetDefaultDimensions = () => {
    onChange({
      tile: {
        length: 60,
        width: 20,
        height: 5,
        jointGap: 0,
      },
    });
  };

  return (
    <div className="space-y-6 bg-slate-900/80 p-5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg text-slate-100">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-semibold text-base flex items-center gap-2 text-sky-400">
          <Maximize2 className="w-4 h-4" />
          <span>Dimensiuni Suprafață & Dale</span>
        </h3>
        <span className="text-xs bg-sky-500/10 text-sky-400 px-2 py-1 rounded-full font-mono border border-sky-500/20">
          Implicit: 60×20 cm
        </span>
      </div>

      {/* Surface Area Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-medium text-slate-300">Suprafață de Acoperit</label>
          <span className="font-mono text-emerald-400 text-sm font-semibold">
            {surface.totalArea} m²
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="100"
          step="1"
          value={surface.totalArea}
          onChange={handleAreaSliderChange}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>5 m² (Alee Mică)</span>
          <span>50 m²</span>
          <span>100 m² (Suprafață Max)</span>
        </div>
      </div>

      {/* Quick Surface Presets */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-amber-400">Presetări Dimensiuni Suprafață</label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() =>
              onChange({
                surface: {
                  ...surface,
                  width: 1.2,
                  length: 6.0,
                  totalArea: 7.2,
                },
              })
            }
            className={`p-2 rounded-lg border text-left font-mono transition flex flex-col ${
              surface.width === 1.2 && surface.length === 6.0
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>120×600 cm</span>
              <span className="text-[9px] bg-amber-500/30 text-amber-200 px-1 py-0.5 rounded font-mono">PRINCIPAL</span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">Alee 1.2m × 6.0m (7.2 m²)</span>
          </button>
          <button
            onClick={() =>
              onChange({
                surface: {
                  ...surface,
                  width: 2.4,
                  length: 4.8,
                  totalArea: 11.52,
                },
              })
            }
            className={`p-2 rounded-lg border text-left font-mono transition flex flex-col ${
              surface.width === 2.4 && surface.length === 4.8
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span>240×480 cm</span>
            <span className="text-[10px] text-slate-400 font-sans">Terasă 2.4m × 4.8m (11.5 m²)</span>
          </button>
        </div>
      </div>

      {/* Surface Dimensions Inputs (L x W) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-400 flex items-center gap-1">
            <MoveHorizontal className="w-3.5 h-3.5 text-slate-400" />
            Lățime (Metri)
          </label>
          <input
            type="number"
            min="1"
            max="25"
            step="0.2"
            value={surface.width}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-sky-500 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400 flex items-center gap-1">
            <MoveVertical className="w-3.5 h-3.5 text-slate-400" />
            Lungime (Metri - Pas 20cm)
          </label>
          <input
            type="number"
            min="1"
            max="25"
            step="0.2"
            value={surface.length}
            onChange={(e) => handleLengthChange(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Auto-Extend Dimensions for Min-Cut Optimization */}
      <button
        onClick={() => {
          const opt = optimizeSurfaceDimensionsForMinCut(surface, tile);
          onChange({
            surface: {
              ...surface,
              width: opt.width,
              length: opt.length,
              totalArea: opt.totalArea,
            },
            useLongitudinalBorder: true,
          });
        }}
        className="w-full bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-sky-500/20 border border-emerald-500/40 hover:border-emerald-400 p-2.5 rounded-lg text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
      >
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>Extinde Lățimea & Lungimea pentru Tăieri Minime</span>
      </button>

      {/* Border Alignment & Interlocking Strategy */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-slate-200 flex items-center gap-1.5 text-emerald-400">
            <LayoutGrid className="w-3.5 h-3.5" />
            Aliniere Margine & Pierderi Minime
          </label>
        </div>

        {/* Longitudinal Perimeter Frame Toggle */}
        <button
          onClick={() => onChange({ useLongitudinalBorder: !config.useLongitudinalBorder })}
          className={`w-full p-2.5 rounded-lg border text-left transition flex items-center justify-between gap-2 text-xs ${
            config.useLongitudinalBorder
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${config.useLongitudinalBorder ? 'text-amber-400' : 'text-slate-500'}`} />
            <div className="flex flex-col">
              <span>Bordură Perimetrală cu Plăci Longitudinale Intacte</span>
              <span className="text-[10px] text-slate-400 font-normal">
                Așează pe contur un rând de plăci întregi nerotite pentru protecție și minimizarea tăierii.
              </span>
            </div>
          </div>
          <div className={`w-9 h-5 rounded-full transition p-0.5 ${config.useLongitudinalBorder ? 'bg-amber-500' : 'bg-slate-800'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition transform ${config.useLongitudinalBorder ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onChange({ borderAlignment: 'straight-edge' })}
            className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-1 ${
              (config.borderAlignment || 'straight-edge') === 'straight-edge'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Margine Dreaptă Origine</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">Min Pierderi</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal leading-tight">
              Aliniază dalele de 60×20 cm lipite de bordura dreaptă (0,0). Folosește raportul 3:1 pentru zero tăieturi pe contur.
            </span>
          </button>

          <button
            onClick={() => onChange({ borderAlignment: 'centered' })}
            className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-1 ${
              config.borderAlignment === 'centered'
                ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Dispunere Centrată</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">Simetric</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal leading-tight">
              Centrează rețeaua pe mijlocul suprafeței. Tăieturile perimetrale sunt distribuite egal.
            </span>
          </button>
        </div>
      </div>

      <div className="border-t border-slate-800 my-4" />

      {/* Tile Dimensions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-xs text-slate-200 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-emerald-400" />
            Dimensiuni Dală din Beton
          </label>
          <button
            onClick={resetDefaultDimensions}
            className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
            title="Resetare la 60x20 cm"
          >
            <RotateCcw className="w-3 h-3" />
            Resetare (60×20)
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400">Lungime (cm)</span>
            <input
              type="number"
              min="10"
              max="120"
              value={tile.length}
              onChange={(e) =>
                onChange({ tile: { ...tile, length: Number(e.target.value) } })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">Lățime (cm)</span>
            <input
              type="number"
              min="10"
              max="80"
              value={tile.width}
              onChange={(e) =>
                onChange({ tile: { ...tile, width: Number(e.target.value) } })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">Grosime (cm)</span>
            <input
              type="number"
              min="2"
              max="10"
              value={tile.height}
              onChange={(e) =>
                onChange({ tile: { ...tile, height: Number(e.target.value) } })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Joint / Grout Gap Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Grosime Rost Chituire</span>
            <span className="font-mono text-sky-400 font-medium">{tile.jointGap} mm</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={tile.jointGap}
            onChange={(e) =>
              onChange({ tile: { ...tile, jointGap: Number(e.target.value) } })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>
      </div>
    </div>
  );
};
