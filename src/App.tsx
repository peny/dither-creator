import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Palette, Scissors, FileText, Edit3 } from 'lucide-react';
import { SegmentationState, SegmentType, ImageSegment, UploadedSVG, AppState } from './types';
import ImageUpload from './components/ImageUpload';
import SegmentationCanvas from './components/SegmentationCanvas';
import SegmentationControls from './components/SegmentationControls';
import DitherPatterns from './components/DitherPatterns';
import ExportControls from './components/ExportControls';
import SVGUpload from './components/SVGUpload';
import SVGPatternEditor from './components/SVGPatternEditor';

const SEGMENT_TYPES: { id: SegmentType; name: string; icon: string }[] = [
  { id: 'hair', name: 'Hair', icon: '💇' },
  { id: 'left-eye', name: 'Left Eye', icon: '👁️' },
  { id: 'right-eye', name: 'Right Eye', icon: '👁️' },
  { id: 'nose', name: 'Nose', icon: '👃' },
  { id: 'mouth', name: 'Mouth', icon: '👄' },
  { id: 'face', name: 'Face', icon: '👤' },
  { id: 'neck', name: 'Neck', icon: '🫁' },
  { id: 'torso', name: 'Torso', icon: '🫀' },
  { id: 'clothing-1', name: 'Clothing 1', icon: '👕' },
  { id: 'clothing-2', name: 'Clothing 2', icon: '👔' },
  { id: 'left-arm', name: 'Left Arm', icon: '🫲' },
  { id: 'right-arm', name: 'Right Arm', icon: '🫱' },
  { id: 'left-hand', name: 'Left Hand', icon: '🤚' },
  { id: 'right-hand', name: 'Right Hand', icon: '✋' },
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
  const [hoveredSegment, setHoveredSegment] = useState<SegmentType | null>(null);
  const [uploadedSVGs, setUploadedSVGs] = useState<UploadedSVG[]>([]);
  const [selectedSVG, setSelectedSVG] = useState<UploadedSVG | null>(null);
  const [activeMode, setActiveMode] = useState<'create' | 'edit'>('create');

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

  const handleSegmentHover = useCallback((segmentType: SegmentType | null) => {
    setHoveredSegment(segmentType);
  }, []);

  const handlePatternOffsetChange = useCallback((segmentId: string, offset: { x: number; y: number }) => {
    setSegmentationState(prev => ({
      ...prev,
      segments: prev.segments.map(segment =>
        segment.id === segmentId
          ? { ...segment, patternOffset: offset }
          : segment
      ),
    }));
  }, []);

  const handleSVGUpload = useCallback((svg: UploadedSVG) => {
    setUploadedSVGs(prev => [...prev, svg]);
  }, []);

  const handleSVGSelect = useCallback((svg: UploadedSVG) => {
    setSelectedSVG(svg);
    setActiveMode('edit');
  }, []);

  const handleSVGDelete = useCallback((svgId: string) => {
    setUploadedSVGs(prev => prev.filter(svg => svg.id !== svgId));
    if (selectedSVG?.id === svgId) {
      setSelectedSVG(null);
      setActiveMode('create');
    }
  }, [selectedSVG]);

  const handleModeSwitch = useCallback((mode: 'create' | 'edit') => {
    setActiveMode(mode);
    if (mode === 'create') {
      setSelectedSVG(null);
    }
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

      {/* Mode Selection */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => handleModeSwitch('create')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: activeMode === 'create' ? '#646cff' : '#f5f5f5',
            color: activeMode === 'create' ? 'white' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          <Upload size={18} />
          Create New
        </button>
        <button
          onClick={() => handleModeSwitch('edit')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: activeMode === 'edit' ? '#646cff' : '#f5f5f5',
            color: activeMode === 'edit' ? 'white' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          <Edit3 size={18} />
          Edit SVG
        </button>
      </div>

      {activeMode === 'edit' ? (
        <div>
          <SVGUpload
            onSVGUpload={handleSVGUpload}
            uploadedSVGs={uploadedSVGs}
            onSVGSelect={handleSVGSelect}
            selectedSVG={selectedSVG}
            onSVGDelete={handleSVGDelete}
          />

          {selectedSVG && (
            <SVGPatternEditor
              uploadedSVG={selectedSVG}
              onSVGUpdate={(updatedSVG) => {
                setUploadedSVGs(prev => 
                  prev.map(svg => svg.id === updatedSVG.id ? updatedSVG : svg)
                );
                setSelectedSVG(updatedSVG);
              }}
            />
          )}
        </div>
      ) : (
        <>
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
                onSegmentHover={handleSegmentHover}
                segments={segmentationState.segments}
              />

              <SegmentationCanvas
                ref={canvasRef}
                imageData={segmentationState.imageData}
                imageDimensions={segmentationState.imageDimensions!}
                currentSegment={segmentationState.currentSegment}
                hoveredSegment={hoveredSegment}
                segments={segmentationState.segments}
                onSegmentComplete={handleSegmentComplete}
              />

              {segmentationState.segments.length > 0 && (
                <DitherPatterns
                  segments={segmentationState.segments}
                  onDitherPatternChange={handleDitherPatternChange}
                  onPatternOffsetChange={handlePatternOffsetChange}
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
        </>
      )}
    </div>
  );
};

export default App;
