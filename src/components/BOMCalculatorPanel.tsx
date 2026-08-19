import React from 'react';
import type { ConfigState, BOMResult } from '../types/configurator';
import { Calculator, Package, Scale, DollarSign, Layers, Scissors, Sparkles } from 'lucide-react';
import { KeyMetricsSummaryPanel } from './KeyMetricsSummaryPanel';

interface BOMCalculatorPanelProps {
  config: ConfigState;
  bom: BOMResult;
  onChange: (updated: Partial<ConfigState>) => void;
}

export const BOMCalculatorPanel: React.FC<BOMCalculatorPanelProps> = ({ config, bom, onChange }) => {
  return (
    <div className="space-y-6 bg-slate-900/90 p-5 rounded-xl border border-slate-800 backdrop-blur-md shadow-xl text-slate-100">
      {/* Prominent High-Contrast Metrics Summary Panel */}
      <KeyMetricsSummaryPanel bom={bom} wasteFactor={config.surface.wasteFactor} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-semibold text-base flex items-center gap-2 text-emerald-400">
          <Calculator className="w-5 h-5" />
          <span>Necesar de Materiale & Costuri (BOM)</span>
        </h3>
        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-mono font-medium border border-emerald-500/20">
          {bom.totalTilesNeeded} Dale Necesare
        </span>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tile Count Card */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Dale Beton</span>
            <Package className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {bom.totalTilesNeeded} <span className="text-xs font-normal text-slate-400">buc</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Întregi: {bom.fullTileCount}</span>
            <span>Tăieturi: {bom.physicalCutsCount}</span>
          </div>
        </div>

        {/* Total Weight Card */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Greutate Totală</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {bom.totalWeightTonnes} <span className="text-xs font-normal text-slate-400">tone</span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            ({bom.totalWeightKg.toLocaleString()} kg total)
          </div>
        </div>

        {/* Pallets Needed Card */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Paleți Necesar</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {bom.palletsNeeded} <span className="text-xs font-normal text-slate-400">paleți</span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            ({bom.tilesPerPallet} dale / palet)
          </div>
        </div>

        {/* Estimated Cost Card */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cost Estimat Materiale</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            ${bom.totalCost.toLocaleString('ro-RO', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            (${(bom.totalCost / (bom.coverageAreaM2 || 1)).toFixed(2)} / m²)
          </div>
        </div>
      </div>

      {/* Waste Allowance & Price Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
        {/* Waste Allowance Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-medium text-slate-300 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              Rezervă Pierderi & Tăieturi Contur
            </label>
            <span className="font-mono text-amber-400 font-semibold">
              +{config.surface.wasteFactor}% ({bom.wasteTileCount} dale în plus)
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="25"
            step="1"
            value={config.surface.wasteFactor}
            onChange={(e) =>
              onChange({
                surface: { ...config.surface, wasteFactor: Number(e.target.value) },
              })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="text-[10px] text-slate-500 flex justify-between">
            <span>5% (Model Simplu)</span>
            <span>10% (Standard)</span>
            <span>25% (Brăduț / Tăieturi Mari)</span>
          </div>
        </div>

        {/* Price Per Tile Input */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Preț Unitar per Dală ($)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0.5"
              max="50"
              step="0.25"
              value={config.unitPricePerTile}
              onChange={(e) =>
                onChange({ unitPricePerTile: Number(e.target.value) })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
            <span className="absolute left-2.5 top-2.5 text-xs text-slate-500">$</span>
          </div>
        </div>
      </div>

      {/* Zero-Waste & 3:1 Integer Division Efficiency Card */}
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Raport 3:1 & Optimizare Pierderi Margine Dreaptă
          </span>
          <span className="text-[11px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
            {bom.recycledCutPlanksSaved} Dale Salvate prin Reutilizare Tăieturi
          </span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          Deoarece 3 dale de lățime <strong className="text-white">20 cm</strong> sunt egale cu lungimea unei dale de <strong className="text-white">60 cm</strong> (raport $3:1$), alinierea liniei de pornire la margine dreaptă elimină tăieturile inițiale.
          Algoritmul de re-împerechere a bucăților tăiate a optimizat cele <strong className="text-emerald-300">{bom.cutTileCount} bucăți perimetrale</strong> executând doar <strong className="text-white">{bom.physicalCutsCount} tăieturi</strong> pe <strong className="text-white">{bom.parentPaversCut} dale întregi</strong>, salvând <strong className="text-emerald-400 font-bold">{bom.recycledCutPlanksSaved} dale întregi</strong>!
        </p>
      </div>

      {/* Detailed Material Breakdown Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Detaliere Specificații Materiale
        </h4>
        <div className="bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-3 font-medium">Descriere Element</th>
                <th className="py-2.5 px-3 font-medium">Specificație</th>
                <th className="py-2.5 px-3 font-medium text-right">Cantitate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2 px-3 font-medium text-white">Dale Beton Aspect Lemn</td>
                <td className="py-2 px-3 text-slate-400">
                  {config.tile.length} × {config.tile.width} × {config.tile.height} cm ({config.woodFinish.name})
                </td>
                <td className="py-2 px-3 text-right font-mono font-semibold text-sky-400">
                  {bom.totalTilesNeeded} buc
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-white">Nisip / Material Chituire Rosturi</td>
                <td className="py-2 px-3 text-slate-400">
                  Rost de {config.tile.jointGap} mm ({config.grout.name})
                </td>
                <td className="py-2 px-3 text-right font-mono font-semibold text-amber-400">
                  {bom.groutSandKg} kg
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-white">Greutate per Dală</td>
                <td className="py-2 px-3 text-slate-400">Beton Armat Arhitectural (2.35 g/cm³)</td>
                <td className="py-2 px-3 text-right font-mono text-slate-300">
                  {bom.singleTileWeightKg} kg / dală
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-white">Paleți / Lăzi Transport</td>
                <td className="py-2 px-3 text-slate-400">Lăzi Lemn Standard (48 buc/palet)</td>
                <td className="py-2 px-3 text-right font-mono text-purple-400 font-semibold">
                  {bom.palletsNeeded} paleți
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
