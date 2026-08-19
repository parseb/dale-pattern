export interface TileDimensions {
  length: number; // cm (default 60)
  width: number;  // cm (default 20)
  height: number; // cm (default 5)
  jointGap: number; // mm (default 3)
}

export type SurfaceShape = 'rectangle' | 'square' | 'l-shape' | 'pathway';

export interface SurfaceDimensions {
  shape: SurfaceShape;
  length: number; // meters
  width: number;  // meters
  lLength1?: number; // meters (for L-Shape leg 1)
  lWidth1?: number;  // meters (for L-Shape cutout)
  totalArea: number; // m² (5 to 100)
  wasteFactor: number; // percentage (e.g. 10%)
}

export type ArrangementPattern = 
  | 'herringbone-90' // 90° Standard Herringbone
  | 'herringbone-45'; // 45° Diagonal Herringbone

export interface WoodFinish {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  grainColor: string;
  poreColor: string;
  previewGradient: string;
}

export interface GroutOption {
  id: string;
  name: string;
  color: string;
}

export interface PlacedTile {
  id: string;
  x: number; // top-left x in cm relative to surface origin
  y: number; // top-left y in cm relative to surface origin
  width: number; // rendered width in cm
  height: number; // rendered height in cm
  rotation: number; // degrees (0, 90, 45, etc)
  isCut: boolean;
  cutAreaRatio: number; // 1.0 = full tile, < 1.0 = cut tile
  cutPieceType?: 'full' | 'two-thirds' | 'one-third' | 'diagonal-half'; // Standard third-cut categorization (60x20, 40x20, 20x20, diagonal 20x20)
  gridRow?: number;
  gridCol?: number;
}

export interface BOMResult {
  fullTileCount: number;
  cutTileCount: number;
  parentPaversCut: number;
  physicalCutsCount: number;
  wasteTileCount: number;
  recycledCutPlanksSaved: number;
  totalTilesNeeded: number;
  coverageAreaM2: number;
  singleTileWeightKg: number;
  totalWeightKg: number;
  totalWeightTonnes: number;
  groutSandKg: number;
  palletsNeeded: number;
  tilesPerPallet: number;
  totalCost: number;
  cuttingWastePercentage: number;
}

export type BorderAlignmentStrategy = 'straight-edge' | 'centered';

export interface ConfigState {
  tile: TileDimensions;
  surface: SurfaceDimensions;
  pattern: ArrangementPattern;
  patternAngle: number; // 0 to 90 degrees
  borderAlignment: BorderAlignmentStrategy; // 'straight-edge' minimizes perimeter cuts
  lockToTileMultiples?: boolean; // Force surface dimensions to exact tile multipliers
  woodFinish: WoodFinish;
  grout: GroutOption;
  woodGrainIntensity: number; // 0.1 to 1.0;
  showCutHighlight: boolean;
  showDimensions: boolean;
  showGrid: boolean;
  useLongitudinalBorder?: boolean; // Place intact longitudinal planks along perimeter borders
  unitPricePerTile: number;
  viewMode: '2d' | '3d';
}

export interface PresetProject {
  id: string;
  title: string;
  description: string;
  area: number;
  shape: SurfaceShape;
  dimensions: { length: number; width: number };
  pattern: ArrangementPattern;
  woodFinishId: string;
  iconName: string;
}
