import type {
  TileDimensions,
  SurfaceDimensions,
  ArrangementPattern,
  PlacedTile,
  BOMResult,
  BorderAlignmentStrategy,
} from '../types/configurator';

/**
 * Calculates 4 world corners for a tile box centered at (x + w/2, y + h/2) with rotation.
 */
function getTileCorners(x: number, y: number, w: number, h: number, rotDeg: number) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rad = (rotDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const local = [
    { x: -w / 2, y: -h / 2 },
    { x: w / 2, y: -h / 2 },
    { x: w / 2, y: h / 2 },
    { x: -w / 2, y: h / 2 },
  ];

  return local.map((pt) => ({
    x: cx + (pt.x * cos - pt.y * sin),
    y: cy + (pt.x * sin + pt.y * cos),
  }));
}

/**
 * Generates exact 2D tile layout coordinates for concrete paver planks (60x20 cm default).
 * Main pattern focus: Herringbone (Brăduț 90° & 45°) with Straight-Edge perimeter optimization.
 */
export function generateTileLayout(
  tile: TileDimensions,
  surface: SurfaceDimensions,
  pattern: ArrangementPattern,
  patternAngle: number = 0,
  _borderAlignment: BorderAlignmentStrategy = 'straight-edge',
  useLongitudinalBorder: boolean = false
): PlacedTile[] {
  const tileLenCm = tile.length; // 60 cm
  const tileWidCm = tile.width;  // 20 cm
  const gapCm = (tile.jointGap ?? 0) / 10; // Joint gap in cm

  const surfWidthCm = surface.width * 100;
  const surfLengthCm = surface.length * 100;

  const placedTiles: PlacedTile[] = [];

  const effLen = tileLenCm + gapCm;
  const effWid = tileWidCm + gapCm;

  let minX_field = 0;
  let maxX_field = surfWidthCm;
  let minY_field = 0;
  let maxY_field = surfLengthCm;

  let index = 0;

  // If longitudinal border frame is enabled, place intact whole planks along perimeter
  if (useLongitudinalBorder) {
    minX_field = tileWidCm;
    maxX_field = surfWidthCm - tileWidCm;
    minY_field = tileWidCm;
    maxY_field = surfLengthCm - tileWidCm;

    // Top & Bottom Longitudinal Planks (Horizontal 60x20 cm)
    const countH = Math.floor(surfWidthCm / tileLenCm);
    for (let i = 0; i < countH; i++) {
      placedTiles.push({
        id: `border-top-${index++}`,
        x: i * tileLenCm,
        y: 0,
        width: tileLenCm,
        height: tileWidCm,
        rotation: 0,
        isCut: false,
        cutAreaRatio: 1.0,
      });
      placedTiles.push({
        id: `border-bot-${index++}`,
        x: i * tileLenCm,
        y: surfLengthCm - tileWidCm,
        width: tileLenCm,
        height: tileWidCm,
        rotation: 0,
        isCut: false,
        cutAreaRatio: 1.0,
      });
    }

    // Left & Right Longitudinal Planks (Vertical 20x60 cm)
    const innerLen = surfLengthCm - 2 * tileWidCm;
    const countV = Math.floor(innerLen / tileLenCm);
    for (let i = 0; i < countV; i++) {
      placedTiles.push({
        id: `border-left-${index++}`,
        x: 0,
        y: tileWidCm + i * tileLenCm,
        width: tileWidCm,
        height: tileLenCm,
        rotation: 0,
        isCut: false,
        cutAreaRatio: 1.0,
      });
      placedTiles.push({
        id: `border-right-${index++}`,
        x: surfWidthCm - tileWidCm,
        y: tileWidCm + i * tileLenCm,
        width: tileWidCm,
        height: tileLenCm,
        rotation: 0,
        isCut: false,
        cutAreaRatio: 1.0,
      });
    }
  }

  if (pattern === 'herringbone-90' || pattern === 'herringbone-45') {
    let effectiveAngle = patternAngle || 0;
    if (pattern === 'herringbone-45' && effectiveAngle === 0) {
      effectiveAngle = 45;
    }

    const isRotated = effectiveAngle % 360 !== 0;

    const surfCx = surfWidthCm / 2;
    const surfCy = surfLengthCm / 2;

    const maxDim = Math.max(surfWidthCm, surfLengthCm);
    const rangeU = isRotated ? Math.ceil((maxDim * 2.2) / effWid) + 8 : Math.ceil((surfWidthCm * 1.5) / effWid) + 5;
    const rangeV = isRotated ? Math.ceil((maxDim * 2.2) / effWid) + 8 : Math.ceil((surfLengthCm * 1.5) / effWid) + 5;

    let index = 0;

    for (let u = -rangeU; u <= rangeU; u++) {
      for (let v = -rangeV; v <= rangeV; v++) {
        // 2D True Herringbone Lattice:
        // Cell origin (ox, oy) in units of tile width (effWid):
        // ox = 1*u + 2*v
        // oy = -1*u + 4*v
        const ox = 1 * u + 2 * v;
        const oy = -1 * u + 4 * v;

        const rawCandidates = [
          // Vertical Plank V (size: tileWidCm x tileLenCm, baseRot: 0)
          {
            type: 'V',
            x: ox * effWid,
            y: oy * effWid,
            w: tileWidCm,
            h: tileLenCm,
            baseRot: 0,
          },
          // Horizontal Plank H (size: tileLenCm x tileWidCm, baseRot: 0)
          {
            type: 'H',
            x: (ox + 1) * effWid,
            y: (oy + 2) * effWid,
            w: tileLenCm,
            h: tileWidCm,
            baseRot: 0,
          },
        ];

        for (const cand of rawCandidates) {
          if (!isRotated) {
            // 90° Orthogonal Modular Herringbone: Strict third-cut modularity
            const candX = minX_field + cand.x;
            const candY = minY_field + cand.y;

            const ix1 = Math.max(candX, minX_field);
            const ix2 = Math.min(candX + cand.w, maxX_field);
            const iy1 = Math.max(candY, minY_field);
            const iy2 = Math.min(candY + cand.h, maxY_field);

            if (ix2 > ix1 && iy2 > iy1) {
              const wPiece = Math.round(ix2 - ix1);
              const hPiece = Math.round(iy2 - iy1);

              const isCut = wPiece < cand.w || hPiece < cand.h;
              let cutPieceType: 'full' | 'two-thirds' | 'one-third' | 'diagonal-half' = 'full';
              let cutAreaRatio = 1.0;

              if (isCut) {
                const len = cand.type === 'H' ? wPiece : hPiece;
                if (len >= 40) {
                  cutPieceType = 'two-thirds';
                  cutAreaRatio = 2 / 3;
                } else {
                  cutPieceType = 'one-third';
                  cutAreaRatio = 1 / 3;
                }
              }

              placedTiles.push({
                id: `tile-${index++}`,
                x: ix1,
                y: iy1,
                width: wPiece,
                height: hPiece,
                rotation: 0,
                isCut,
                cutAreaRatio,
                cutPieceType,
                gridRow: u,
                gridCol: v,
              });
            }
          } else {
            // Rotated Herringbone (15°, 30°, 45°, 90°, etc.): Rotate around surface center
            const tileCx = cand.x + cand.w / 2;
            const tileCy = cand.y + cand.h / 2;

            const rad = (effectiveAngle * Math.PI) / 180;
            const rx = tileCx - surfCx;
            const ry = tileCy - surfCy;

            const finalCx = surfCx + (rx * Math.cos(rad) - ry * Math.sin(rad));
            const finalCy = surfCy + (rx * Math.sin(rad) + ry * Math.cos(rad));
            const finalRot = cand.baseRot + effectiveAngle;

            const fx = finalCx - cand.w / 2;
            const fy = finalCy - cand.h / 2;

            const corners = getTileCorners(fx, fy, cand.w, cand.h, finalRot);

            const minX = Math.min(...corners.map((c) => c.x));
            const maxX = Math.max(...corners.map((c) => c.x));
            const minY = Math.min(...corners.map((c) => c.y));
            const maxY = Math.max(...corners.map((c) => c.y));

            if (maxX > minX_field && minX < maxX_field && maxY > minY_field && minY < maxY_field) {
              const isFullyInside = corners.every(
                (c) => c.x >= minX_field && c.x <= maxX_field && c.y >= minY_field && c.y <= maxY_field
              );
              const isCut = !isFullyInside;

              placedTiles.push({
                id: `tile-${index++}`,
                x: Math.round(fx * 10) / 10,
                y: Math.round(fy * 10) / 10,
                width: cand.w,
                height: cand.h,
                rotation: finalRot,
                isCut,
                cutAreaRatio: isCut ? 0.17 : 1.0,
                cutPieceType: isCut ? 'diagonal-half' : 'full',
                gridRow: u,
                gridCol: v,
              });
            }
          }
        }
      }
    }
  } else {
    // Fallback Stretcher Bond for legacy compatibility
    const cols = Math.ceil(surfWidthCm / effLen) + 2;
    const rows = Math.ceil(surfLengthCm / effWid) + 2;

    let index = 0;
    for (let r = -1; r < rows; r++) {
      const rowShift = (r % 2 === 0) ? 0 : effLen / 2;
      for (let c = -1; c < cols; c++) {
        const x = c * effLen + rowShift;
        const y = r * effWid;

        const overlapsX = x < surfWidthCm && x + tileLenCm > 0;
        const overlapsY = y < surfLengthCm && y + tileWidCm > 0;

        if (overlapsX && overlapsY) {
          const isFullyInside =
            x >= 0 &&
            y >= 0 &&
            x + tileLenCm <= surfWidthCm &&
            y + tileWidCm <= surfLengthCm;

          placedTiles.push({
            id: `tile-${index++}`,
            x: Math.round(x * 10) / 10,
            y: Math.round(y * 10) / 10,
            width: tileLenCm,
            height: tileWidCm,
            rotation: 0,
            isCut: !isFullyInside,
            cutAreaRatio: isFullyInside ? 1.0 : 0.5,
            gridRow: r,
            gridCol: c,
          });
        }
      }
    }
  }

  return placedTiles;
}

/**
 * Calculates Cut Piece Recycling & Bin-Packing details.
 * Takes advantage of 3:1 plank ratio (60x20 cm = 3 squares of 20x20 cm).
 */
export function calculateCutReuseDetails(
  placedTiles: PlacedTile[],
  tile: TileDimensions
): {
  cutPiecePositions: number;
  parentPaversCut: number;
  physicalCutsCount: number;
  reusedPiecesCount: number;
} {
  const cutTiles = placedTiles.filter((t) => t.isCut);
  if (cutTiles.length === 0) {
    return {
      cutPiecePositions: 0,
      parentPaversCut: 0,
      physicalCutsCount: 0,
      reusedPiecesCount: 0,
    };
  }

  // Quantized third-cut module length harvested (40cm for 2/3, 20cm for 1/3, 10cm for diagonal-half)
  const cutPieceLengths = cutTiles.map((t) => {
    if (t.cutPieceType === 'two-thirds') return 40;
    if (t.cutPieceType === 'one-third') return 20;
    if (t.cutPieceType === 'diagonal-half') return 10;
    return Math.max(20, Math.min(tile.length, Math.round((t.cutAreaRatio || 0.5) * tile.length)));
  });

  cutPieceLengths.sort((a, b) => b - a);

  const parentPlankBins: { remainingCm: number; piecesCount: number }[] = [];

  for (const len of cutPieceLengths) {
    let placedInExisting = false;
    for (let i = 0; i < parentPlankBins.length; i++) {
      if (parentPlankBins[i].remainingCm >= len - 0.001) {
        parentPlankBins[i].remainingCm -= len;
        parentPlankBins[i].piecesCount += 1;
        placedInExisting = true;
        break;
      }
    }
    if (!placedInExisting) {
      parentPlankBins.push({
        remainingCm: tile.length - len,
        piecesCount: 1,
      });
    }
  }

  const parentPaversCut = parentPlankBins.length;
  const reusedPiecesCount = Math.max(0, cutTiles.length - parentPaversCut);
  const physicalCutsCount = parentPlankBins.reduce(
    (acc, bin) => acc + Math.max(1, bin.piecesCount - 1),
    0
  );

  return {
    cutPiecePositions: cutTiles.length,
    parentPaversCut,
    physicalCutsCount,
    reusedPiecesCount,
  };
}

/**
 * Calculates Bill of Materials (BOM), weights, tile counts, and waste percentages.
 */
export function calculateBOM(
  tile: TileDimensions,
  surface: SurfaceDimensions,
  placedTiles: PlacedTile[],
  unitPricePerTile: number = 4.50
): BOMResult {
  const coverageAreaM2 = surface.totalArea > 0 
    ? surface.totalArea 
    : surface.width * surface.length;

  // Placed tile breakdown
  const fullTiles = placedTiles.filter(t => !t.isCut).length;
  const cutTiles = placedTiles.filter(t => t.isCut).length;

  // Cut Piece Bin-Packing Recycling Algorithm
  const reuseDetails = calculateCutReuseDetails(placedTiles, tile);
  const parentPlanksForCuts = reuseDetails.parentPaversCut;
  const recycledCutPlanksSaved = reuseDetails.reusedPiecesCount;

  // Total base parent planks needed before general breakage buffer
  const basePlanksRequired = fullTiles + parentPlanksForCuts;

  // Waste buffer allowance
  const wasteFactor = surface.wasteFactor || 10;
  const wasteTileCount = Math.ceil(basePlanksRequired * (wasteFactor / 100));
  const totalTilesNeeded = basePlanksRequired + wasteTileCount;

  // Single tile volume & concrete weight
  const tileVolumeM3 = (tile.length / 100) * (tile.width / 100) * (tile.height / 100);
  const singleTileWeightKg = Math.round(tileVolumeM3 * 2350 * 10) / 10; // ~14.1 kg for 60x20x5

  const totalWeightKg = Math.round(totalTilesNeeded * singleTileWeightKg);
  const totalWeightTonnes = Math.round((totalWeightKg / 1000) * 100) / 100;

  // Grout / sand volume estimate
  const jointGapMm = tile.jointGap;
  const groutSandKgPerM2 = 0.15 * jointGapMm;
  const groutSandKg = Math.round(coverageAreaM2 * groutSandKgPerM2 * 10) / 10;

  // Pallet estimation (standard pallet = 48 planks)
  const tilesPerPallet = 48;
  const palletsNeeded = Math.ceil(totalTilesNeeded / tilesPerPallet);

  const totalCost = Math.round(totalTilesNeeded * unitPricePerTile * 100) / 100;

  return {
    fullTileCount: fullTiles,
    cutTileCount: cutTiles,
    parentPaversCut: reuseDetails.parentPaversCut,
    physicalCutsCount: reuseDetails.physicalCutsCount,
    wasteTileCount,
    recycledCutPlanksSaved,
    totalTilesNeeded,
    coverageAreaM2: Math.round(coverageAreaM2 * 100) / 100,
    singleTileWeightKg,
    totalWeightKg,
    totalWeightTonnes,
    groutSandKg,
    palletsNeeded,
    tilesPerPallet,
    totalCost,
    cuttingWastePercentage: wasteFactor,
  };
}

/**
 * Calculates zero-cut rectangular surface dimensions snapped to exact tile module multipliers.
 */
export function generateZeroCutSurfaceDimensions(
  targetArea: number,
  tile: TileDimensions
): { width: number; length: number; totalArea: number } {
  const L = tile.length / 100; // e.g. 0.6 m
  const moduleStep = L; // 0.6 m for 60x20 plank (since 3 * 0.2m = 0.6m)

  // Target aspect ratio ~1.33:1 (rectangular)
  const targetW = Math.sqrt(targetArea / 1.33);
  const targetL = targetArea / targetW;

  const M = Math.max(1, Math.round(targetW / moduleStep));
  const N = Math.max(1, Math.round(targetL / moduleStep));

  const width = Math.round(M * moduleStep * 100) / 100;
  const length = Math.round(N * moduleStep * 100) / 100;
  const totalArea = Math.round(width * length * 100) / 100;

  return { width, length, totalArea };
}

export interface ZeroCutWeaveMatch {
  pattern: ArrangementPattern;
  patternName: string;
  patternAngle: number;
  totalTiles: number;
  cutTiles: number;
  parentPaversCut: number;
  physicalCutsCount: number;
  reusedPiecesCount: number;
  isZeroCut: boolean;
  wastePercentage: number;
}

/**
 * Searches Herringbone configurations for minimal cut layout optimization.
 */
export function searchZeroCutWeavePatterns(
  tile: TileDimensions,
  surface: SurfaceDimensions
): ZeroCutWeaveMatch[] {
  const weaveCandidatePatterns: Array<{ id: ArrangementPattern; name: string }> = [
    { id: 'herringbone-90', name: 'Model Brăduț Standard 90°' },
    { id: 'herringbone-45', name: 'Model Brăduț Diagonal 45°' },
  ];

  const results: ZeroCutWeaveMatch[] = [];

  for (const item of weaveCandidatePatterns) {
    for (const angle of [0, 90]) {
      const placed = generateTileLayout(tile, surface, item.id, angle, 'straight-edge');
      const reuseDetails = calculateCutReuseDetails(placed, tile);

      results.push({
        pattern: item.id,
        patternName: item.name + (angle === 90 ? ' (Decalat 90°)' : ''),
        patternAngle: angle,
        totalTiles: placed.length,
        cutTiles: reuseDetails.cutPiecePositions,
        parentPaversCut: reuseDetails.parentPaversCut,
        physicalCutsCount: reuseDetails.physicalCutsCount,
        reusedPiecesCount: reuseDetails.reusedPiecesCount,
        isZeroCut: reuseDetails.cutPiecePositions === 0,
        wastePercentage: reuseDetails.cutPiecePositions === 0 ? 0 : Math.round((reuseDetails.parentPaversCut / (placed.length || 1)) * 100),
      });
    }
  }

  // Sort: zero-cut first, then by minimum physical cuts needed
  results.sort((a, b) => {
    if (a.isZeroCut && !b.isZeroCut) return -1;
    if (!a.isZeroCut && b.isZeroCut) return 1;
    return a.physicalCutsCount - b.physicalCutsCount;
  });

  return results;
}

/**
 * Calculates optimal surface dimensions (width & length in meters)
 * by extending the current surface to exact module multipliers (multiples of tile width/length: 20cm / 60cm).
 * Eliminates cut waste by ensuring longitudinal border planks and inner Herringbone weave fit completely.
 */
export function optimizeSurfaceDimensionsForMinCut(
  surface: SurfaceDimensions,
  tile: TileDimensions
): { width: number; length: number; totalArea: number; extendedWidthCm: number; extendedLengthCm: number } {
  const currentW_cm = Math.round(surface.width * 100);
  const currentL_cm = Math.round(surface.length * 100);

  const stepCm = tile.width; // 20 cm module step for 60x20 plank

  // Snap to next module step
  let optW_cm = Math.ceil(currentW_cm / stepCm) * stepCm;
  let optL_cm = Math.ceil(currentL_cm / stepCm) * stepCm;

  // Ensure full tile length (60 cm) multiples where needed
  if (optW_cm % tile.length !== 0) {
    optW_cm = Math.ceil(optW_cm / tile.length) * tile.length;
  }
  if (optL_cm % tile.length !== 0) {
    optL_cm = Math.ceil(optL_cm / tile.length) * tile.length;
  }

  const finalW_m = Math.round((optW_cm / 100) * 10) / 10;
  const finalL_m = Math.round((optL_cm / 100) * 10) / 10;
  const totalArea = Math.round(finalW_m * finalL_m * 100) / 100;

  const extW = Math.round(optW_cm - currentW_cm);
  const extL = Math.round(optL_cm - currentL_cm);

  return {
    width: finalW_m,
    length: finalL_m,
    totalArea,
    extendedWidthCm: extW > 0 ? extW : 0,
    extendedLengthCm: extL > 0 ? extL : 0,
  };
}
