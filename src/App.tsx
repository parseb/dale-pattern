import React, { useState, useMemo } from 'react';
import type { ConfigState, PlacedTile, BOMResult } from './types/configurator';
import { WOOD_FINISHES, GROUT_OPTIONS } from './utils/constants';
import { generateTileLayout, calculateBOM } from './utils/patternGenerator';
import { Canvas2DViewer } from './components/Canvas2DViewer';
import { Canvas3DViewer } from './components/Canvas3DViewer';
import { SurfaceConfigPanel } from './components/SurfaceConfigPanel';
import { PatternSelector } from './components/PatternSelector';
import { MaterialTexturePicker } from './components/MaterialTexturePicker';
import { BOMCalculatorPanel } from './components/BOMCalculatorPanel';
import { ExportSummaryModal } from './components/ExportSummaryModal';
import { KeyMetricsSummaryPanel } from './components/KeyMetricsSummaryPanel';

import {
  Layers,
  Box,
  Eye,
  Grid,
  Maximize2,
  FileText,
  Sparkles,
  Scissors,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

export const App: React.FC = () => {
  // Main Configurator State
  const [config, setConfig] = useState<ConfigState>({
    tile: {
      length: 60, // Default 60 cm
      width: 20,  // Default 20 cm
      height: 5,  // Default 5 cm
      jointGap: 0, // 0 mm space between tiles per request
    },
    surface: {
      shape: 'rectangle',
      width: 1.2,  // 120 cm (1.2m)
      length: 6.0, // 600 cm (6.0m)
      totalArea: 7.2, // 7.2 m² surface (120 × 600 cm zero-cut module)
      wasteFactor: 0,
    },
    pattern: 'herringbone-90', // Default to 90° Herringbone weave
    patternAngle: 0,
    borderAlignment: 'straight-edge', // Priority 1: straight border origin (zero initial cut waste)
    woodFinish: WOOD_FINISHES[0], // Stejar Scandinav
    grout: GROUT_OPTIONS[0], // Antracit
    woodGrainIntensity: 0.75,
    showCutHighlight: true,
    showDimensions: true,
    showGrid: true,
    unitPricePerTile: 4.50,
    viewMode: '2d',
  });

  const [activeTab, setActiveTab] = useState<'surface' | 'pattern' | 'finish' | 'bom'>('pattern');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Partial update helper
  const handleConfigChange = (updated: Partial<ConfigState>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  // Compute layout tiles whenever surface, tile dimensions, pattern, angle, or border alignment changes
  const placedTiles: PlacedTile[] = useMemo(() => {
    return generateTileLayout(
      config.tile,
      config.surface,
      config.pattern,
      config.patternAngle,
      config.borderAlignment || 'straight-edge',
      config.useLongitudinalBorder || false
    );
  }, [config.tile, config.surface, config.pattern, config.patternAngle, config.borderAlignment, config.useLongitudinalBorder]);

  // Compute Bill of Materials (BOM) summary
  const bom: BOMResult = useMemo(() => {
    return calculateBOM(
      config.tile,
      config.surface,
      placedTiles,
      config.unitPricePerTile
    );
  }, [config.tile, config.surface, placedTiles, config.unitPricePerTile]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none flex items-center gap-2">
              Configurator Pavaj Dale Beton
              <span className="text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Standard: 60×20 cm
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Dale din Beton cu Aspect de Lemn • Configurator Model Brăduț Fără Pierderi
            </p>
          </div>
        </div>



        {/* Viewport 2D/3D & Export Button */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center">
            <button
              onClick={() => handleConfigChange({ viewMode: '2d' })}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                config.viewMode === '2d'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Plan 2D
            </button>
            <button
              onClick={() => handleConfigChange({ viewMode: '3d' })}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                config.viewMode === '3d'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              Vedere 3D
            </button>
          </div>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-600/20 transition"
          >
            <FileText className="w-4 h-4" />
            <span>Export Fișă Tehnică</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout (Split Screen) */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 lg:p-6 gap-6 max-w-[1700px] w-full mx-auto">
        {/* Left Sidebar: Controls Tabs & Configuration Panels */}
        <div className="w-full lg:w-[460px] flex flex-col gap-4 flex-shrink-0">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('surface')}
              className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 ${
                activeTab === 'surface'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Suprafață
            </button>
            <button
              onClick={() => setActiveTab('pattern')}
              className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 ${
                activeTab === 'pattern'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Modele
            </button>
            <button
              onClick={() => setActiveTab('finish')}
              className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 ${
                activeTab === 'finish'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Finisaje
            </button>
            <button
              onClick={() => setActiveTab('bom')}
              className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 ${
                activeTab === 'bom'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Calculat
            </button>
          </div>

          {/* Active Panel Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {activeTab === 'surface' && (
              <SurfaceConfigPanel config={config} onChange={handleConfigChange} />
            )}
            {activeTab === 'pattern' && (
              <PatternSelector
                config={config}
                onChange={handleConfigChange}
              />
            )}
            {activeTab === 'finish' && (
              <MaterialTexturePicker config={config} onChange={handleConfigChange} />
            )}
            {activeTab === 'bom' && (
              <BOMCalculatorPanel config={config} bom={bom} onChange={handleConfigChange} />
            )}
          </div>
        </div>

        {/* Right Area: Main Interactive Viewport Canvas */}
        <div className="flex-1 flex flex-col gap-3 min-h-[550px]">
          {/* Prominent Key Metrics Summary Panel (Tiles Used, Cuts Needed, Waste) */}
          <KeyMetricsSummaryPanel bom={bom} wasteFactor={config.surface.wasteFactor} />

          {/* Viewport Toolbar */}
          <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 backdrop-blur-md text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-400" />
                {config.viewMode === '2d' ? 'Planimetrie 2D' : 'Proiecție Izometrică 3D'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                Model: <strong className="text-sky-300 capitalize">{config.pattern.includes('90') ? 'Brăduț / Herringbone 90°' : 'Brăduț Diagonal 45°'}</strong>
              </span>

              {bom.cutTileCount === 0 && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 0 Tăieturi • Acoperire Perfectă
                </span>
              )}
            </div>

            <div className="flex items-[#gap-4] gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={config.showCutHighlight}
                  onChange={(e) => handleConfigChange({ showCutHighlight: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span className="flex items-center gap-1 text-amber-400">
                  <Scissors className="w-3.5 h-3.5" /> Evidențiere Dale Tăiate
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={config.showGrid}
                  onChange={(e) => handleConfigChange({ showGrid: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0"
                />
                <span>Rrețea Ghidare</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={config.showDimensions}
                  onChange={(e) => handleConfigChange({ showDimensions: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0"
                />
                <span>Cote & Dimensiuni</span>
              </label>
            </div>
          </div>

          {/* Interactive Canvas Viewport */}
          <div className="flex-1 relative">
            {config.viewMode === '2d' ? (
              <Canvas2DViewer config={config} placedTiles={placedTiles} />
            ) : (
              <Canvas3DViewer config={config} placedTiles={placedTiles} />
            )}
          </div>
        </div>
      </main>

      {/* Floating Bottom Quick BOM Metric Bar */}
      <footer className="border-t border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-3 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-slate-400">Dimensiuni Dală:</span>{' '}
            <strong className="text-white font-mono">{config.tile.length}×{config.tile.width}×{config.tile.height} cm</strong>
          </div>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div>
            <span className="text-slate-400">Suprafață Totală:</span>{' '}
            <strong className="text-emerald-400 font-mono">{bom.coverageAreaM2} m²</strong>
          </div>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div>
            <span className="text-slate-400">Total Dale Necesare:</span>{' '}
            <strong className="text-sky-400 font-mono">{bom.totalTilesNeeded} buc</strong> ({bom.fullTileCount} întregi, {bom.cutTileCount} tăieturi)
          </div>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div>
            <span className="text-slate-400">Greutate Totală:</span>{' '}
            <strong className="text-amber-400 font-mono">{bom.totalWeightTonnes} tone</strong>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('bom')}
          className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
        >
          Afișează Calculul Detaliat BOM →
        </button>
      </footer>

      {/* Export Modal */}
      <ExportSummaryModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        config={config}
        bom={bom}
        placedTiles={placedTiles}
      />
    </div>
  );
};

export default App;
