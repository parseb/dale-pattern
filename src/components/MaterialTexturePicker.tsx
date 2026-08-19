import React from 'react';
import type { ConfigState } from '../types/configurator';
import { WOOD_FINISHES, GROUT_OPTIONS } from '../utils/constants';
import { Palette, Layers, Sliders } from 'lucide-react';

interface MaterialTexturePickerProps {
  config: ConfigState;
  onChange: (updated: Partial<ConfigState>) => void;
}

export const MaterialTexturePicker: React.FC<MaterialTexturePickerProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-6 bg-slate-900/80 p-5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-semibold text-base flex items-center gap-2 text-sky-400">
          <Palette className="w-4 h-4" />
          <span>Finisaje Lemn & Culori Rosturi</span>
        </h3>
      </div>

      {/* Wood Finish Options */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-slate-300">Nuanțe & Textură Lemn Beton</label>
        <div className="grid grid-cols-2 gap-2.5">
          {WOOD_FINISHES.map((finish) => {
            const isSelected = config.woodFinish.id === finish.id;
            return (
              <button
                key={finish.id}
                onClick={() => onChange({ woodFinish: finish })}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-sky-950/60 border-sky-500 shadow-md shadow-sky-500/10 ring-1 ring-sky-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg border border-white/20 shadow-inner flex-shrink-0"
                  style={{ background: finish.previewGradient }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white truncate">
                    {finish.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {finish.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wood Grain Relief Intensity Slider */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex justify-between items-center text-xs">
          <label className="font-medium text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Intensitate Relief Textură Lemn
          </label>
          <span className="font-mono text-amber-400 font-semibold">
            {Math.round(config.woodGrainIntensity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={config.woodGrainIntensity}
          onChange={(e) => onChange({ woodGrainIntensity: Number(e.target.value) })}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      {/* Grout Color Options */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          Culoare Material Chituire / Rosturi
        </label>
        <div className="flex flex-wrap gap-2">
          {GROUT_OPTIONS.map((grout) => {
            const isSelected = config.grout.id === grout.id;
            return (
              <button
                key={grout.id}
                onClick={() => onChange({ grout })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-medium'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-slate-600 shadow-sm"
                  style={{ backgroundColor: grout.color }}
                />
                <span>{grout.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
