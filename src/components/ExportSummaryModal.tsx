import React, { useState } from 'react';
import type { ConfigState, BOMResult, PlacedTile } from '../types/configurator';
import { X, Printer, Download, FileText, Scissors, Layers, Box, Eye, Maximize2 } from 'lucide-react';
import { Canvas2DViewer } from './Canvas2DViewer';
import { Canvas3DViewer } from './Canvas3DViewer';
import { HorizontalFullLayoutViewer } from './HorizontalFullLayoutViewer';
import { calculateCutReuseDetails } from '../utils/patternGenerator';

interface ExportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConfigState;
  bom: BOMResult;
  placedTiles: PlacedTile[];
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
  isOpen,
  onClose,
  config,
  bom,
  placedTiles,
}) => {
  const [activeTab, setActiveTab] = useState<'both' | '2d' | '3d'>('both');

  if (!isOpen) return null;

  // Exact Piece Breakdown Counts
  const fullCount = placedTiles.filter(
    (t) => t.cutPieceType === 'full' || (!t.isCut && !t.cutPieceType)
  ).length;
  const twoThirdsCount = placedTiles.filter((t) => t.cutPieceType === 'two-thirds').length;
  const oneThirdCount = placedTiles.filter((t) => t.cutPieceType === 'one-third').length;
  const diagonalHalfCount = placedTiles.filter((t) => t.cutPieceType === 'diagonal-half').length;

  const cutDetails = calculateCutReuseDetails(placedTiles, config.tile);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      config,
      bom,
      totalPlacedTiles: placedTiles.length,
      pieceBreakdown: {
        full60x20: fullCount,
        twoThirds40x20: twoThirdsCount,
        oneThird20x20: oneThirdCount,
        diagonalHalf20x20: diagonalHalfCount,
      },
      cuttingInstructions: {
        parentPaversToCut: cutDetails.parentPaversCut,
        physicalCutsCount: cutDetails.physicalCutsCount,
        reusedPiecesCount: cutDetails.reusedPiecesCount,
      },
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fisa-tehnica-pavaj-${config.surface.totalArea}m2.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in print:p-0 print:static print:bg-white print:backdrop-blur-none export-summary-modal-backdrop">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[95vh] flex flex-col print:max-h-none print:border-none print:shadow-none print:w-full print:text-slate-900 print:bg-white">
        
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/80 print:bg-white print:border-b-2 print:border-slate-900 print:py-1.5 print:px-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 print:hidden">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white print:text-[17px] print:text-slate-900 print:font-black tracking-tight">
                FIȘĂ TEHNICĂ DE EXECUȚIE & MONTAJ PAVAI
              </h2>
              <p className="text-xs text-slate-400 print:text-[11px] print:text-slate-700 print:font-bold">
                Dale Beton {config.tile.length}×{config.tile.width}×{config.tile.height} cm • Model Brăduț 90° (Herringbone)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition print:hidden"
            title="Închide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 overflow-y-auto space-y-3.5 text-sm print:overflow-visible print:space-y-2 print:p-2.5 print:bg-white">

          {/* Project Header Summary Card */}
          <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 space-y-1.5 print:bg-slate-50 print:border-slate-300 print:p-2 print:space-y-1">
            <div className="flex items-center justify-between text-xs text-sky-400 font-medium print:text-slate-900 print:text-[11px]">
              <span className="font-bold uppercase tracking-wider">Sumar Configurație Proiect</span>
              <span className="font-mono text-slate-700 font-bold">Emis: {new Date().toLocaleDateString('ro-RO')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-0.5 print:gap-2 print:pt-0">
              <div>
                <span className="text-xs text-slate-400 print:text-slate-700 print:text-[11px] block font-bold">Dimensiuni Suprafață:</span>
                <div className="text-sm font-bold text-white print:text-[14px] print:text-slate-900 font-mono print:font-black">
                  {config.surface.width} m × {config.surface.length} m ({config.surface.totalArea} m²)
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 print:text-slate-700 print:text-[11px] block font-bold">Model Țesătură:</span>
                <div className="text-sm font-bold text-emerald-400 print:text-[14px] print:text-slate-900 font-mono capitalize print:font-black">
                  {config.pattern.includes('90') ? 'Brăduț 90°' : 'Brăduț Diagonal 45°'}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 print:text-slate-700 print:text-[11px] block font-bold">Aspect Finisaj:</span>
                <div className="text-sm font-bold text-amber-400 print:text-[14px] print:text-slate-900 font-mono print:font-black">
                  {config.woodFinish.name}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 print:text-slate-700 print:text-[11px] block font-bold">Tăieturi Necesare:</span>
                <div className="text-sm font-bold text-amber-300 print:text-[14px] print:text-slate-900 font-mono print:font-black">
                  {cutDetails.physicalCutsCount} tăieturi ({cutDetails.parentPaversCut} dale)
                </div>
              </div>
            </div>
          </div>

          {/* 1. VISUAL LAYOUT PREVIEWS (2D TOP & 3D ISOMETRIC SIDE BY SIDE) */}
          <div className="space-y-2 print:space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 print:text-slate-900 print:text-[11.5px] print:font-black">
                <Layers className="w-4 h-4 print:w-3.5 print:h-3.5" />
                Schițe Vizuale Detaliate (Plan 2D & Perspectivă 3D)
              </h3>

              {/* Viewport Toggle Switcher (Hidden in print mode) */}
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs print:hidden">
                <button
                  onClick={() => setActiveTab('both')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    activeTab === 'both' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Ambele (2D + 3D)
                </button>
                <button
                  onClick={() => setActiveTab('2d')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    activeTab === '2d' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Plan 2D
                </button>
                <button
                  onClick={() => setActiveTab('3d')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    activeTab === '3d' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Perspectivă 3D
                </button>
              </div>
            </div>

            {/* Side-by-Side Viewers - Clean Ink-Saving Print Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2 print:gap-2">
              {(activeTab === 'both' || activeTab === '2d' || true) && (
                <div className={`bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col print:bg-white print:border-slate-300 ${activeTab !== 'both' && activeTab !== '2d' ? 'print:flex hidden' : 'flex'}`}>
                  <div className="px-2.5 py-1 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 print:bg-slate-100 print:text-slate-900 print:py-0.5 print:px-2">
                    <span className="font-medium flex items-center gap-1 print:text-[11px] print:font-bold">
                      <Eye className="w-3.5 h-3.5 text-sky-400 print:w-3 print:h-3" /> Vedere 2D (Detaliu Suprafață)
                    </span>
                  </div>
                  <div className="h-44 relative w-full bg-slate-950 flex items-center justify-center print:h-32 print:bg-white">
                    <Canvas2DViewer config={config} placedTiles={placedTiles} isPrintMode={true} />
                  </div>
                </div>
              )}

              {(activeTab === 'both' || activeTab === '3d' || true) && (
                <div className={`bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col print:bg-white print:border-slate-300 ${activeTab !== 'both' && activeTab !== '3d' ? 'print:flex hidden' : 'flex'}`}>
                  <div className="px-2.5 py-1 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 print:bg-slate-100 print:text-slate-900 print:py-0.5 print:px-2">
                    <span className="font-medium flex items-center gap-1 print:text-[11px] print:font-bold">
                      <Box className="w-3.5 h-3.5 text-amber-400 print:w-3 print:h-3" /> Perspectivă 3D Isometrică
                    </span>
                  </div>
                  <div className="h-44 relative w-full bg-slate-950 flex items-center justify-center print:h-32 print:bg-white">
                    <Canvas3DViewer config={config} placedTiles={placedTiles} isPrintMode={true} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. PIECE COUNT BREAKDOWN TABLE (60x20, 40x20, 20x20) */}
          <div className="space-y-1.5 print:space-y-1">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 print:text-slate-900 print:text-[11.5px] print:font-black">
              <Layers className="w-4 h-4 print:w-3.5 print:h-3.5" />
              Descompunere Bucăți Modularizate (60×20, 40×20, 20×20 CM)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs print:gap-1.5">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-300 print:p-1.5">
                <span className="text-slate-400 print:text-slate-700 block text-[11px] font-bold">Dale Întregi (60×20 cm)</span>
                <div className="text-lg font-bold font-mono text-white mt-0.5 print:text-[14px] print:text-slate-900 print:font-black">
                  {fullCount} <span className="text-xs font-normal text-slate-400 print:text-slate-700 print:text-[11px] print:font-bold">buc</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-300 print:p-1.5">
                <span className="text-slate-400 print:text-slate-700 block text-[11px] font-bold">Bucăți 2/3 (40×20 cm)</span>
                <div className="text-lg font-bold font-mono text-amber-400 mt-0.5 print:text-[14px] print:text-slate-900 print:font-black">
                  {twoThirdsCount} <span className="text-xs font-normal text-slate-400 print:text-slate-700 print:text-[11px] print:font-bold">buc</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-300 print:p-1.5">
                <span className="text-slate-400 print:text-slate-700 block text-[11px] font-bold">Bucăți 1/3 (20×20 cm)</span>
                <div className="text-lg font-bold font-mono text-sky-400 mt-0.5 print:text-[14px] print:text-slate-900 print:font-black">
                  {oneThirdCount} <span className="text-xs font-normal text-slate-400 print:text-slate-700 print:text-[11px] print:font-bold">buc</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-300 print:p-1.5">
                <span className="text-slate-400 print:text-slate-700 block text-[11px] font-bold">Dale Salvate Reciclate</span>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5 print:text-[14px] print:text-slate-900 print:font-black">
                  {cutDetails.reusedPiecesCount} <span className="text-xs font-normal text-slate-400 print:text-slate-700 print:text-[11px] print:font-bold">buc</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. STEP-BY-STEP CUTTING INSTRUCTIONS */}
          <div className="bg-amber-950/20 p-3 rounded-xl border border-amber-800/40 text-xs text-amber-200 space-y-1 print:bg-slate-50 print:border-slate-300 print:text-slate-900 print:p-2 print:space-y-1">
            <div className="font-semibold text-amber-400 flex items-center justify-between print:text-slate-900 print:text-[11px]">
              <span className="flex items-center gap-1 font-bold print:font-black">
                <Scissors className="w-3.5 h-3.5 text-amber-400 print:text-slate-800 print:w-3.5 print:h-3.5" />
                Instrucțiuni de Debitare Transversală:
              </span>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 print:bg-slate-200 print:text-slate-900 font-mono font-bold print:text-[11px]">
                {cutDetails.parentPaversCut} Dale de debitat • {cutDetails.physicalCutsCount} Tăieturi Totale
              </span>
            </div>

            <ol className="list-decimal pl-4 space-y-0.5 text-slate-300 print:text-slate-800 print:text-[11px] print:leading-snug">
              <li>
                Selectați <strong className="text-amber-400 print:text-slate-900 font-black">{cutDetails.parentPaversCut} dale 60×20 cm</strong>. Trasați o linie la <strong className="text-white print:text-slate-900 font-black">40 cm</strong> de capăt.
              </li>
              <li>
                Executați 1 singură tăietură per dală → obțineți perechea: <strong className="text-amber-400 print:text-slate-900 font-black">1x 40×20 cm (2/3)</strong> + <strong className="text-sky-400 print:text-slate-900 font-black">1x 20×20 cm (1/3)</strong>.
              </li>
              <li>
                Montați bucățile debitate pe marginile suprafeței. Economisiți <strong className="text-emerald-400 print:text-slate-900 font-black">{cutDetails.reusedPiecesCount} dale întregi</strong> (Zero Pierderi).
              </li>
            </ol>
          </div>

          {/* 4. BILL OF MATERIALS & LOGISTICS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs print:gap-1.5">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 print:bg-slate-50 print:border-slate-300 print:p-1.5">
              <span className="text-slate-400 print:text-slate-700 print:text-[11px] block font-bold">Total Dale de Comandat</span>
              <div className="font-mono text-sm font-bold text-emerald-400 mt-0.5 print:text-[14px] print:text-slate-900 print:font-black">
                {bom.totalTilesNeeded} buc ({bom.wasteTileCount} rezervă)
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 print:bg-slate-50 print:border-slate-300 print:p-1.5">
              <span className="text-slate-400 print:text-slate-700 print:text-[11px] block font-bold">Număr Paleți (48 buc/palet)</span>
              <div className="font-mono text-sm font-bold text-sky-400 mt-0.5 print:text-[14px] print:text-slate-900 print:font-black">
                {bom.palletsNeeded} paleți
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 print:bg-slate-50 print:border-slate-300 print:p-1.5">
              <span className="text-slate-400 print:text-slate-700 print:text-[11px] block font-bold">Greutate Totală Proiect</span>
              <div className="font-mono text-sm font-bold text-amber-400 mt-0.5 print:text-[14px] print:text-slate-900 print:font-black">
                {bom.totalWeightTonnes} Tone ({bom.totalWeightKg.toLocaleString()} kg)
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 print:bg-slate-50 print:border-slate-300 print:p-1.5">
              <span className="text-slate-400 print:text-slate-700 print:text-[11px] block font-bold">Cost Estimat Total</span>
              <div className="font-mono text-sm font-bold text-emerald-400 mt-0.5 print:text-[14px] print:text-slate-900 print:font-black">
                ${bom.totalCost.toLocaleString('ro-RO', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* 5. FULL-WIDTH HORIZONTAL COMPLETE SKETCH AT BOTTOM */}
          <div className="space-y-1.5 print:space-y-1">
            <h3 className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center justify-between print:text-slate-900 print:text-[11.5px] print:font-black">
              <span className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 print:w-3.5 print:h-3.5 text-sky-400" />
                Plan General de Montaj Orizontal (100% Suprafață Integrată)
              </span>
              <span className="text-[10px] text-slate-400 font-normal print:text-slate-700 print:text-[10px] print:font-bold">
                Orientare Orizontală pentru Vizibilitate Maximă
              </span>
            </h3>

            <div className="w-full h-64 print:h-[275px]">
              <HorizontalFullLayoutViewer config={config} placedTiles={placedTiles} />
            </div>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-slate-800 bg-slate-950/80 print:hidden">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
          >
            <Download className="w-4 h-4" />
            Descărcare Specificație (JSON)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-lg transition"
          >
            <Printer className="w-4 h-4" />
            Tipărire Fișă Tehnică Complete
          </button>
        </div>
      </div>
    </div>
  );
};
