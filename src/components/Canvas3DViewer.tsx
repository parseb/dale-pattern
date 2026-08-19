import React, { useRef, useEffect, useState } from 'react';
import type { ConfigState, PlacedTile } from '../types/configurator';
import { RotateCcw, Move } from 'lucide-react';

interface Canvas3DViewerProps {
  config: ConfigState;
  placedTiles: PlacedTile[];
  isPrintMode?: boolean;
}

export const Canvas3DViewer: React.FC<Canvas3DViewerProps> = ({ config, placedTiles, isPrintMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Viewport State
  const [tiltAngle, setTiltAngle] = useState<number>(38); // degrees
  const [rotationAngle, setRotationAngle] = useState<number>(35); // degrees
  const [zoom, setZoom] = useState<number>(1.1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const surfWidthCm = config.surface.width * 100;
  const surfLengthCm = config.surface.length * 100;

  // Mouse & Touch Drag Controls for 3D Orbiting
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    setRotationAngle((prev) => (prev + dx * 0.5 + 360) % 360);
    setTiltAngle((prev) => Math.max(10, Math.min(85, prev - dy * 0.4)));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    setRotationAngle((prev) => (prev + dx * 0.5 + 360) % 360);
    setTiltAngle((prev) => Math.max(10, Math.min(85, prev - dy * 0.4)));
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Wheel Scroll Zoom Listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.max(0.4, Math.min(3.5, prev * zoomFactor)));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.parentElement?.clientWidth || 800;
    const displayHeight = canvas.parentElement?.clientHeight || 600;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Draw Environment Background (White in print mode to save ink)
    if (isPrintMode) {
      ctx.fillStyle = '#ffffff';
    } else {
      const envGrad = ctx.createRadialGradient(
        displayWidth / 2, displayHeight / 2, 50,
        displayWidth / 2, displayHeight / 2, displayWidth
      );
      envGrad.addColorStop(0, '#1e293b');
      envGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = envGrad;
    }
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Center origin
    ctx.save();
    ctx.translate(displayWidth / 2, displayHeight / 2 + 30);
    ctx.scale(zoom, zoom);

    // 3D Isometric Matrix Transform Projection
    const tiltRad = (tiltAngle * Math.PI) / 180;
    const rotRad = (rotationAngle * Math.PI) / 180;

    // Convert 2D (x, y, z) to 3D projected screen coordinates (px, py)
    const project3D = (x: number, y: number, z: number = 0) => {
      const cx = x - surfWidthCm / 2;
      const cy = y - surfLengthCm / 2;

      const rx = cx * Math.cos(rotRad) - cy * Math.sin(rotRad);
      const ry = cx * Math.sin(rotRad) + cy * Math.cos(rotRad);

      const px = rx;
      const py = ry * Math.sin(tiltRad) - z * Math.cos(tiltRad);

      return { px, py };
    };

    // 2. Draw Ground Surroundings
    const paddingCm = 80;
    const groundPts = [
      project3D(-paddingCm, -paddingCm, 0),
      project3D(surfWidthCm + paddingCm, -paddingCm, 0),
      project3D(surfWidthCm + paddingCm, surfLengthCm + paddingCm, 0),
      project3D(-paddingCm, surfLengthCm + paddingCm, 0),
    ];

    ctx.fillStyle = '#172554';
    ctx.beginPath();
    ctx.moveTo(groundPts[0].px, groundPts[0].py);
    groundPts.forEach(p => ctx.lineTo(p.px, p.py));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. Draw Substrate Sand Bed Shadow & Grout Layer
    const groutPts = [
      project3D(0, 0, 0),
      project3D(surfWidthCm, 0, 0),
      project3D(surfWidthCm, surfLengthCm, 0),
      project3D(0, surfLengthCm, 0),
    ];

    ctx.fillStyle = config.grout.color;
    ctx.beginPath();
    ctx.moveTo(groutPts[0].px, groutPts[0].py);
    groutPts.forEach(p => ctx.lineTo(p.px, p.py));
    ctx.closePath();
    ctx.fill();

    // 4. Render 3D Extruded Concrete Planks
    const tileHeightCm = config.tile.height;

    // Sort tiles by depth so back-to-front rendering works properly
    const sortedTiles = [...placedTiles].sort((a, b) => {
      const pA = project3D(a.x + a.width / 2, a.y + a.height / 2, 0);
      const pB = project3D(b.x + b.width / 2, b.y + b.height / 2, 0);
      return pA.py - pB.py;
    });

    sortedTiles.forEach((t) => {
      const w = t.width;
      const h = t.height;
      const rot = (t.rotation || 0) * (Math.PI / 180);

      // Local tile corners relative to tile center
      const localCorners = [
        { x: -w / 2, y: -h / 2 },
        { x: w / 2, y: -h / 2 },
        { x: w / 2, y: h / 2 },
        { x: -w / 2, y: h / 2 },
      ];

      // Rotate & translate to surface coordinates
      const cx = t.x + w / 2;
      const cy = t.y + h / 2;

      const surfCorners = localCorners.map((c) => {
        const rx = c.x * Math.cos(rot) - c.y * Math.sin(rot);
        const ry = c.x * Math.sin(rot) + c.y * Math.cos(rot);
        return { x: cx + rx, y: cy + ry };
      });

      // Bottom face points (z = 0)
      const botPts = surfCorners.map((c) => project3D(c.x, c.y, 0));
      // Top face points (z = tileHeightCm)
      const topPts = surfCorners.map((c) => project3D(c.x, c.y, tileHeightCm));

      // Draw Extruded Sides
      ctx.fillStyle = config.woodFinish.secondaryColor;
      for (let i = 0; i < 4; i++) {
        const next = (i + 1) % 4;
        ctx.beginPath();
        ctx.moveTo(botPts[i].px, botPts[i].py);
        ctx.lineTo(botPts[next].px, botPts[next].py);
        ctx.lineTo(topPts[next].px, topPts[next].py);
        ctx.lineTo(topPts[i].px, topPts[i].py);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw Top Face
      ctx.fillStyle = config.woodFinish.primaryColor;
      ctx.beginPath();
      ctx.moveTo(topPts[0].px, topPts[0].py);
      topPts.forEach((p) => ctx.lineTo(p.px, p.py));
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      if (config.showCutHighlight && t.isCut) {
        ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
        ctx.fill();
      }
    });

    ctx.restore();
    ctx.restore();
  }, [config, placedTiles, tiltAngle, rotationAngle, zoom, surfWidthCm, surfLengthCm]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 overflow-hidden rounded-xl border border-slate-800 shadow-2xl select-none">
      {/* Top Right Quick Reset Action */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 print:hidden">
        <button
          onClick={() => {
            setRotationAngle(35);
            setTiltAngle(38);
            setZoom(1.1);
          }}
          className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/80 text-xs text-slate-300 flex items-center gap-1.5 transition shadow"
          title="Resetare Vizualizare 3D"
        >
          <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
          <span>Resetare 3D</span>
        </button>
      </div>

      {/* Bottom Hint Indicator */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] text-slate-300 print:hidden pointer-events-none">
        <Move className="w-3.5 h-3.5 text-amber-400" />
        <span>Trageți pentru rotație 3D • Scroll pentru zoom ({Math.round(zoom * 100)}%)</span>
      </div>

      {/* Canvas with Mouse & Touch Listeners */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full h-full block cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
      />
    </div>
  );
};
