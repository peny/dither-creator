import React, { useState } from 'react';
import { Palette, Move, RotateCcw } from 'lucide-react';
import { ImageSegment, DitherPattern } from '../types';

interface DitherPatternsProps {
  segments: ImageSegment[];
  onDitherPatternChange: (segmentId: string, patternId: string) => void;
  onPatternOffsetChange?: (segmentId: string, offset: { x: number; y: number }) => void;
}

// Asset-based dither patterns using the new images
const DITHER_PATTERNS: DitherPattern[] = [
  {
    id: 'dithered_marble_1',
    name: 'Marble 1',
    svgPattern: '', // Will be generated dynamically
    preview: '/assets/dithered_marble_1.png',
    assetPath: '/assets/dithered_marble_1.png',
    type: 'image',
    width: 64,
    height: 64,
  },
  {
    id: 'dithered_marble_2',
    name: 'Marble 2',
    svgPattern: '',
    preview: '/assets/dithered_marble_2.png',
    assetPath: '/assets/dithered_marble_2.png',
    type: 'image',
    width: 64,
    height: 64,
  },
  {
    id: 'dithered_nest',
    name: 'Nest',
    svgPattern: '',
    preview: '/assets/dithered_nest.png',
    assetPath: '/assets/dithered_nest.png',
    type: 'image',
    width: 64,
    height: 64,
  },
  // Keep some original SVG patterns as fallbacks
  {
    id: 'dots',
    name: 'Dots',
    svgPattern: `
      <pattern id="dots" patternUnits="userSpaceOnUse" width="8" height="8">
        <circle cx="4" cy="4" r="1" fill="currentColor" opacity="0.8"/>
      </pattern>
    `,
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJkb3RzIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iOCIgaGVpZ2h0PSI4Ij4KICAgICAgPGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9ImN1cnJlbnRDb2xvciIgb3BhY2l0eT0iMC44Ii8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idXJsKCNkb3RzKSIvPgo8L3N2Zz4=',
    type: 'svg',
  },
  {
    id: 'solid',
    name: 'Solid',
    svgPattern: `
      <pattern id="solid" patternUnits="userSpaceOnUse" width="1" height="1">
        <rect width="1" height="1" fill="currentColor"/>
      </pattern>
    `,
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9ImN1cnJlbnRDb2xvciIvPgo8L3N2Zz4=',
    type: 'svg',
  },
];

const DitherPatterns: React.FC<DitherPatternsProps> = ({ 
  segments, 
  onDitherPatternChange, 
  onPatternOffsetChange 
}) => {
  const [editingOffset, setEditingOffset] = useState<string | null>(null);

  const handleOffsetChange = (segmentId: string, field: 'x' | 'y', value: number) => {
    const segment = segments.find(s => s.id === segmentId);
    const currentOffset = segment?.patternOffset || { x: 0, y: 0 };
    const newOffset = { ...currentOffset, [field]: value };
    onPatternOffsetChange?.(segmentId, newOffset);
  };

  const resetOffset = (segmentId: string) => {
    onPatternOffsetChange?.(segmentId, { x: 0, y: 0 });
  };

  return (
    <div>
      <h3 style={{ margin: '2rem 0 1rem 0', color: '#646cff' }}>
        <Palette size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Dither Patterns
      </h3>
      <p style={{ margin: '0 0 1.5rem 0', opacity: 0.8 }}>
        Select dither patterns for each segmented area and adjust pattern positioning
      </p>
      
      {segments.map(segment => (
        <div key={segment.id} style={{ marginBottom: '2rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#888', textTransform: 'capitalize' }}>
            {segment.name}
          </h4>
          
          <div className="dither-patterns">
            {DITHER_PATTERNS.map(pattern => (
              <div
                key={`${segment.id}-${pattern.id}`}
                className={`dither-pattern ${segment.ditherPattern === pattern.id ? 'selected' : ''}`}
                onClick={() => onDitherPatternChange(segment.id, pattern.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <img
                  src={pattern.preview}
                  alt={pattern.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                  {pattern.name}
                </span>
              </div>
            ))}
          </div>

          {/* Pattern Offset Controls */}
          {segment.ditherPattern && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Move size={16} />
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Pattern Offset</span>
                <button
                  onClick={() => resetOffset(segment.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#666' }}>X:</label>
                  <input
                    type="number"
                    value={segment.patternOffset?.x || 0}
                    onChange={(e) => handleOffsetChange(segment.id, 'x', parseInt(e.target.value) || 0)}
                    style={{
                      width: '60px',
                      padding: '0.25rem 0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#666' }}>Y:</label>
                  <input
                    type="number"
                    value={segment.patternOffset?.y || 0}
                    onChange={(e) => handleOffsetChange(segment.id, 'y', parseInt(e.target.value) || 0)}
                    style={{
                      width: '60px',
                      padding: '0.25rem 0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#888' }}>
                Adjust where the pattern starts (0,0 = top-left)
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DitherPatterns;
