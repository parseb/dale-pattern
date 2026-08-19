import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ConfigState, PlacedTile } from '../types/configurator';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Layers } from 'lucide-react';

interface Canvas2DViewerProps {
  config: ConfigState;
  placedTiles: PlacedTile[];
  isPrintMode?: boolean;
}

export const Canvas2DViewer: React.FC<Canvas2DViewerProps> = ({ config, placedTiles, isPrintMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Viewport transforms (Pan & Zoom)
  const [scale, setScale] = useState<number>(1.2);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredTile, setHoveredTile] = useState<PlacedTile | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const surfWidthCm = config.surface.width * 100;
  const surfLengthCm = config.surface.length * 100;

  // Reset zoom & pan to fit surface in container
  const resetView = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const padding = 60;
    const scaleX = (canvas.width - padding * 2) / surfWidthCm;
    const scaleY = (canvas.height - padding * 2) / surfLengthCm;
    const optimalScale = Math.min(scaleX, scaleY, 2.5);
    
    setScale(Math.max(0.4, optimalScale));
    setPan({
      x: (canvas.width - surfWidthCm * optimalScale) / 2,
      y: (canvas.height - surfLengthCm * optimalScale) / 2,
    });
  }, [surfWidthCm, surfLengthCm]);

  useEffect(() => {
    resetView();
  }, [config.surface.width, config.surface.length, resetView]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.parentElement?.clientWidth || 800;
    const displayHeight = canvas.parentElement?.clientHeight || 600;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background (White in print mode, dark slate in UI)
    ctx.fillStyle = isPrintMode ? '#ffffff' : '#111318';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Apply viewport Pan & Zoom transform
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(scale, scale);

    // 1. Draw Surface Ground Substrate
    ctx.fillStyle = '#1c1e24';
    ctx.fillRect(0, 0, surfWidthCm, surfLengthCm);

    // Draw Grout background floor
    ctx.fillStyle = config.grout.color;
    ctx.fillRect(0, 0, surfWidthCm, surfLengthCm);

    // 2. Draw Sub-surface Grid if enabled
    if (config.showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 0.5;
      const gridStepCm = 50; // 50 cm grid lines
      for (let gx = 0; gx <= surfWidthCm; gx += gridStepCm) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, surfLengthCm);
        ctx.stroke();
      }
      for (let gy = 0; gy <= surfLengthCm; gy += gridStepCm) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(surfWidthCm, gy);
        ctx.stroke();
      }
    }

    // 3. Render Placed Tiles with Procedural Wood-Grain Texture
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, surfWidthCm, surfLengthCm);
    ctx.clip();

    placedTiles.forEach((tile) => {
      ctx.save();
      const cx = tile.x + tile.width / 2;
      const cy = tile.y + tile.height / 2;

      ctx.translate(cx, cy);
      if (tile.rotation) {
        ctx.rotate((tile.rotation * Math.PI) / 180);
      }

      const w = tile.width;
      const h = tile.height;
      const x0 = -w / 2;
      const y0 = -h / 2;

      // Base tile color fill
      ctx.fillStyle = config.woodFinish.primaryColor;
      ctx.fillRect(x0, y0, w, h);

      // Procedural Wood Grain Lines
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, y0, w, h);
      ctx.clip();

      ctx.strokeStyle = config.woodFinish.grainColor;
      ctx.globalAlpha = 0.25 * config.woodGrainIntensity;
      ctx.lineWidth = 1.2;

      // Draw subtle grain lines along tile length
      const lineSpacing = 4;
      const seed = (tile.x * 17 + tile.y * 31);
      for (let ly = y0 + 2; ly < y0 + h; ly += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(x0, ly);
        // Create slight wave distortion for natural timber feel
        ctx.bezierCurveTo(
          x0 + w * 0.33,
          ly + Math.sin(seed * 0.5 + ly) * 1.5,
          x0 + w * 0.66,
          ly - Math.cos(seed * 0.3 + ly) * 1.5,
          x0 + w,
          ly
        );
        ctx.stroke();
      }

      ctx.restore();

      // Highlight Cut Edge Planks if toggle is active
      if (config.showCutHighlight && tile.isCut) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.4)'; // Amber transparent overlay
        ctx.fillRect(x0, y0, w, h);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x0, y0, w, h);
      } else {
        // Tile Bevel Outline Border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(x0, y0, w, h);
      }

      // Hover Effect Outline
      if (hoveredTile && hoveredTile.id === tile.id) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x0 - 1, y0 - 1, w + 2, h + 2);
      }

      ctx.restore();
    });

    ctx.restore();

    // 4. Draw Outer Surface Boundary Limit Box
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2 / scale;
    ctx.strokeRect(0, 0, surfWidthCm, surfLengthCm);

    // 5. Render Dimension Annotation Labels on Borders if enabled
    if (config.showDimensions) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';

      const actualWidthCm = Math.round(config.surface.width * 100);
      const actualLengthCm = Math.round(config.surface.length * 100);

      // Top Width Dimension Label
      ctx.fillText(`${config.surface.width} m (${actualWidthCm} cm)`, surfWidthCm / 2, -12);

      // Left Length Dimension Label
      ctx.save();
      ctx.translate(-15, surfLengthCm / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${config.surface.length} m (${actualLengthCm} cm)`, 0, 0);
      ctx.restore();
    }

    ctx.restore(); // Restore pan/zoom matrix

    // 6. Draw Scale Ruler at Bottom Left
    const rulerPixelLen = 100;
    const rulerCmLen = rulerPixelLen / scale;
    const rulerMLen = (rulerCmLen / 100).toFixed(2);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(20, displayHeight - 45, 170, 30);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, displayHeight - 25);
    ctx.lineTo(30 + rulerPixelLen, displayHeight - 25);
    ctx.moveTo(30, displayHeight - 30);
    ctx.lineTo(30, displayHeight - 20);
    ctx.moveTo(30 + rulerPixelLen, displayHeight - 30);
    ctx.lineTo(30 + rulerPixelLen, displayHeight - 20);
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Scară: ${rulerMLen} m`, 30 + rulerPixelLen / 2, displayHeight - 30);

    ctx.restore();
  }, [
    config,
    placedTiles,
    scale,
    pan,
    hoveredTile,
    surfWidthCm,
    surfLengthCm,
  ]);

  // Mouse Handlers for Pan, Zoom & Tile Hover
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    setMousePos({ x: e.clientX, y: e.clientY });

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else {
      // Find hovered tile
      const canvasX = (clientX - pan.x) / scale;
      const canvasY = (clientY - pan.y) / scale;

      const found = placedTiles.find((t) => {
        const cx = t.x + t.width / 2;
        const cy = t.y + t.height / 2;
        if (!t.rotation) {
          return (
            canvasX >= t.x &&
            canvasX <= t.x + t.width &&
            canvasY >= t.y &&
            canvasY <= t.y + t.height
          );
        }
        const rad = (-t.rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const localX = cx + (canvasX - cx) * cos - (canvasY - cy) * sin;
        const localY = cy + (canvasX - cx) * sin + (canvasY - cy) * cos;
        return (
          localX >= t.x &&
          localX <= t.x + t.width &&
          localY >= t.y &&
          localY <= t.y + t.height
        );
      });

      setHoveredTile(found || null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newScale = Math.min(Math.max(0.3, scale * zoomFactor), 4.5);
    
    // Zoom toward cursor position
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseCanvasX = e.clientX - rect.left;
    const mouseCanvasY = e.clientY - rect.top;

    setPan({
      x: mouseCanvasX - (mouseCanvasX - pan.x) * (newScale / scale),
      y: mouseCanvasY - (mouseCanvasY - pan.y) * (newScale / scale),
    });
    setScale(newScale);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 overflow-hidden select-none rounded-xl border border-slate-800 shadow-2xl">
      {/* Interactive Controls Overlay Bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/80 shadow-lg print:hidden">
        <button
          onClick={() => setScale((s) => Math.min(s * 1.25, 4.5))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Mărește (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s * 0.8, 0.3))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Micșorează (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-700 mx-1" />
        <button
          onClick={resetView}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Resetare Vizualizare"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono text-slate-400 pl-1">
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Surface Spec Overlay Indicator */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/80 shadow-lg text-xs text-slate-300 print:hidden">
        <Layers className="w-4 h-4 text-emerald-400" />
        <span>
          Suprafață: <strong className="text-white">{config.surface.width}m × {config.surface.length}m</strong> ({config.surface.totalArea || config.surface.width * config.surface.length} m²)
        </span>
      </div>

      {/* Main HTML5 Canvas element */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Hover Tile Inspector Floating Card */}
      {hoveredTile && !isPrintMode && (
        <div
          className="fixed z-50 pointer-events-none bg-slate-900/95 text-slate-100 text-xs rounded-lg px-3 py-2 shadow-xl border border-sky-500/40 backdrop-blur-sm print:hidden"
          style={{
            left: mousePos.x + 16,
            top: mousePos.y + 16,
          }}
        >
          <div className="font-semibold text-sky-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>Dală {hoveredTile.id}</span>
          </div>
          <div className="mt-1 space-y-0.5 text-slate-300">
            <div>Dim: <strong>{hoveredTile.width} × {hoveredTile.height} cm</strong></div>
            <div>Poz: X={hoveredTile.x.toFixed(0)}cm, Y={hoveredTile.y.toFixed(0)}cm</div>
            <div>
              Stare:{' '}
              {hoveredTile.isCut ? (
                <span className="text-amber-400 font-medium">Dală Tăiată ({Math.round(hoveredTile.cutAreaRatio * 100)}% suprafață)</span>
              ) : (
                <span className="text-emerald-400 font-medium">Dală Întreagă Standard</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
