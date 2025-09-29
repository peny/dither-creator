import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Palette, Scissors } from 'lucide-react';
import { SegmentationState, SegmentType, ImageSegment } from './types';
import ImageUpload from './components/ImageUpload';
import SegmentationCanvas from './components/SegmentationCanvas';
import SegmentationControls from './components/SegmentationControls';
import DitherPatterns from './components/DitherPatterns';
import ExportControls from './components/ExportControls';

const SEGMENT_TYPES: { id: SegmentType; name: string; icon: string }[] = [
  { id: 'hair', name: 'Hair', icon: '💇' },
  { id: 'face', name: 'Face', icon: '👤' },
  { id: 'body', name: 'Body', icon: '👕' },
  { id: 'arms', name: 'Arms', icon: '🫲' },
  { id: 'legs', name: 'Legs', icon: '🦵' },
  { id: 'accessories', name: 'Accessories', icon: '👓' },
  { id: 'background', name: 'Background', icon: '🖼️' },
];

const App: React.FC = () => {
  const [segmentationState, setSegmentationState] = useState<SegmentationState>({
    currentSegment: null,
    segments: [],
    imageData: null,
    imageDimensions: null,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = useCallback((imageData: string, dimensions: { width: number; height: number }) => {
    setSegmentationState(prev => ({
      ...prev,
      imageData,
      imageDimensions: dimensions,
      segments: [], // Reset segments when new image is uploaded
      currentSegment: null,
    }));
  }, []);

  const handleSegmentSelect = useCallback((segmentType: SegmentType) => {
    setSegmentationState(prev => ({
      ...prev,
      currentSegment: segmentType,
    }));
  }, []);

  const handleSegmentComplete = useCallback((segment: ImageSegment) => {
    setSegmentationState(prev => ({
      ...prev,
      segments: [...prev.segments.filter(s => s.id !== segment.id), segment],
    }));
  }, []);

  const handleDitherPatternChange = useCallback((segmentId: string, patternId: string) => {
    setSegmentationState(prev => ({
      ...prev,
      segments: prev.segments.map(segment =>
        segment.id === segmentId
          ? { ...segment, ditherPattern: patternId }
          : segment
      ),
    }));
  }, []);

  const currentInstructions = segmentationState.currentSegment
    ? `Click to place anchor points around the ${SEGMENT_TYPES.find(s => s.id === segmentationState.currentSegment)?.name.toLowerCase()}. Click on the first point or double-click to complete.`
    : 'Select a body part to start segmenting';

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: '#646cff' }}>
          Dither Creator
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#888', margin: 0 }}>
          Upload an image, segment body parts, and export as SVG with dither patterns
        </p>
      </header>

      {!segmentationState.imageData ? (
        <ImageUpload onImageUpload={handleImageUpload} />
      ) : (
        <div>
          <div className="instructions">
            {currentInstructions}
          </div>

          <SegmentationControls
            segmentTypes={SEGMENT_TYPES}
            currentSegment={segmentationState.currentSegment}
            onSegmentSelect={handleSegmentSelect}
            segments={segmentationState.segments}
          />

          <SegmentationCanvas
            ref={canvasRef}
            imageData={segmentationState.imageData}
            imageDimensions={segmentationState.imageDimensions!}
            currentSegment={segmentationState.currentSegment}
            segments={segmentationState.segments}
            onSegmentComplete={handleSegmentComplete}
          />

          {segmentationState.segments.length > 0 && (
            <DitherPatterns
              segments={segmentationState.segments}
              onDitherPatternChange={handleDitherPatternChange}
            />
          )}

          {segmentationState.segments.length > 0 && (
            <ExportControls
              segments={segmentationState.segments}
              imageDimensions={segmentationState.imageDimensions!}
            />
          )}

          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={() => setSegmentationState({
                currentSegment: null,
                segments: [],
                imageData: null,
                imageDimensions: null,
              })}
              style={{ background: '#666' }}
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
