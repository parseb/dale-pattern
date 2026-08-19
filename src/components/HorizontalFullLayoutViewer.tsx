import React, { useRef, useEffect } from 'react';
import type { ConfigState, PlacedTile } from '../types/configurator';

interface HorizontalFullLayoutViewerProps {
  config: ConfigState;
  placedTiles: PlacedTile[];
}

export const HorizontalFullLayoutViewer: React.FC<HorizontalFullLayoutViewerProps> = ({
  config,
  placedTiles,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const surfWidthCm = config.surface.width * 100;
  const surfLengthCm = config.surface.length * 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.parentElement?.clientWidth || 800;
    const displayHeight = canvas.parentElement?.clientHeight || 240;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clean White background (Ink Saver)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Determine horizontal orientation:
    // If length > width, orient length horizontally along screen X-axis
    const isLongerVertical = surfLengthCm > surfWidthCm;
    
    // Virtual surface dimensions on screen after orientation
    const orientWidthCm = isLongerVertical ? surfLengthCm : surfWidthCm;
    const orientHeightCm = isLongerVertical ? surfWidthCm : surfLengthCm;

    const paddingX = 24;
    const paddingY = 22;
    const scaleX = (displayWidth - paddingX * 2) / orientWidthCm;
    const scaleY = (displayHeight - paddingY * 2) / orientHeightCm;
    const fitScale = Math.min(scaleX, scaleY);

    const startX = (displayWidth - orientWidthCm * fitScale) / 2;
    const startY = (displayHeight - orientHeightCm * fitScale) / 2;

    ctx.save();
    ctx.translate(startX, startY);
    ctx.scale(fitScale, fitScale);

    // 1. Draw Surface Substrate Base (Grout Bed)
    ctx.fillStyle = config.grout.color || '#e2e8f0';
    ctx.fillRect(0, 0, orientWidthCm, orientHeightCm);

    // 2. Render Placed Tiles with Strict Boundary Clipping
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, orientWidthCm, orientHeightCm);
    ctx.clip();

    placedTiles.forEach((tile) => {
      ctx.save();

      // Original tile center in 2D surface system
      const origCx = tile.x + tile.width / 2;
      const origCy = tile.y + tile.height / 2;

      // Map center & rotation to horizontal screen system
      const screenCx = isLongerVertical ? origCy : origCx;
      const screenCy = isLongerVertical ? origCx : origCy;
      const screenRot = isLongerVertical ? 90 - (tile.rotation || 0) : tile.rotation || 0;

      ctx.translate(screenCx, screenCy);
      if (screenRot) {
        ctx.rotate((screenRot * Math.PI) / 180);
      }

      const w = tile.width;
      const h = tile.height;
      const x0 = -w / 2;
      const y0 = -h / 2;

      // Base tile color fill (Wood finish)
      ctx.fillStyle = config.woodFinish.primaryColor || '#d97706';
      ctx.fillRect(x0, y0, w, h);

      // Procedural Wood Grain Texture
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, y0, w, h);
      ctx.clip();
      ctx.strokeStyle = config.woodFinish.grainColor || '#78350f';
      ctx.globalAlpha = 0.25 * config.woodGrainIntensity;
      ctx.lineWidth = 1;
      const lineSpacing = 4;
      const seed = tile.x * 17 + tile.y * 31;
      for (let ly = y0 + 2; ly < y0 + h; ly += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(x0, ly);
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

      // Highlight Cut Edge Planks
      if (config.showCutHighlight && tile.isCut) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.fillRect(x0, y0, w, h);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x0, y0, w, h);
      } else {
        // Tile Bevel Outline Border (High Contrast for Print)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(x0, y0, w, h);
      }

      ctx.restore();
    });

    ctx.restore(); // Restore clipping path

    // 3. Draw Outer Surface Boundary Limit Box
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5 / fitScale;
    ctx.strokeRect(0, 0, orientWidthCm, orientHeightCm);

    // 4. Render Dimension Annotation Labels
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${Math.max(13, Math.min(17, 15 / fitScale))}px sans-serif`;
    ctx.textAlign = 'center';

    const topLabel = isLongerVertical
      ? `LUNGIME SUPRAFAȚĂ: ${config.surface.length} m (${surfLengthCm} cm)`
      : `LĂȚIME SUPRAFAȚĂ: ${config.surface.width} m (${surfWidthCm} cm)`;

    const sideLabel = isLongerVertical
      ? `LĂȚIME: ${config.surface.width} m`
      : `LUNGIME: ${config.surface.length} m`;

    // Top Dimension Label
    ctx.fillText(topLabel, orientWidthCm / 2, -6);

    // Left Dimension Label
    ctx.save();
    ctx.translate(-8, orientHeightCm / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(sideLabel, 0, 0);
    ctx.restore();

    ctx.restore();

    // Scale Ruler (Bottom Right)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(
      `Plan General Orizontal (Scară Adaptivă 100% Suprafață Integrată) • ${config.surface.totalArea} m²`,
      displayWidth - 10,
      displayHeight - 6
    );

    ctx.restore();
  }, [config, placedTiles, surfWidthCm, surfLengthCm]);

  return (
    <div className="w-full h-full bg-white print:bg-white rounded-lg border border-slate-300 print:border-slate-400 overflow-hidden relative">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
