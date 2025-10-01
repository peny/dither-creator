export interface ImageSegment {
  id: string;
  name: string;
  mask: string; // Base64 encoded mask data
  svgPath?: string;
  ditherPattern?: string;
  patternOffset?: { x: number; y: number }; // Pattern starting point offset
}

export interface DitherPattern {
  id: string;
  name: string;
  svgPattern: string;
  preview: string; // Base64 encoded preview or asset path
  assetPath?: string; // Path to asset file for image-based patterns
  type: 'svg' | 'image'; // Pattern type
  width?: number; // Pattern width for image-based patterns
  height?: number; // Pattern height for image-based patterns
}

export interface SegmentationState {
  currentSegment: string | null;
  segments: ImageSegment[];
  imageData: string | null;
  imageDimensions: { width: number; height: number } | null;
}

export type SegmentType = 
  | 'hair'
  | 'left-eye'
  | 'right-eye'
  | 'nose'
  | 'mouth'
  | 'face'
  | 'torso'
  | 'clothing-1'
  | 'clothing-2'
  | 'left-arm'
  | 'right-arm'
  | 'left-hand'
  | 'right-hand'
  | 'legs'
  | 'accessories'
  | 'background'
  | 'custom';

export interface ClickPoint {
  x: number;
  y: number;
  type: 'include' | 'exclude';
}

export interface UploadedSVG {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
  segments?: ImageSegment[];
}

export interface AppState {
  segmentationState: SegmentationState;
  uploadedSVGs: UploadedSVG[];
  activeMode: 'create' | 'edit'; // 'create' for new segments, 'edit' for uploaded SVGs
}
