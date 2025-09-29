export interface ImageSegment {
  id: string;
  name: string;
  mask: string; // Base64 encoded mask data
  svgPath?: string;
  ditherPattern?: string;
}

export interface DitherPattern {
  id: string;
  name: string;
  svgPattern: string;
  preview: string; // Base64 encoded preview
}

export interface SegmentationState {
  currentSegment: string | null;
  segments: ImageSegment[];
  imageData: string | null;
  imageDimensions: { width: number; height: number } | null;
}

export type SegmentType = 
  | 'hair'
  | 'face'
  | 'body'
  | 'arms'
  | 'legs'
  | 'accessories'
  | 'background'
  | 'custom';

export interface ClickPoint {
  x: number;
  y: number;
  type: 'include' | 'exclude';
}
