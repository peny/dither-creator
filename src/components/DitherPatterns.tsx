import React from 'react';
import { Palette } from 'lucide-react';
import { ImageSegment, DitherPattern } from '../types';

interface DitherPatternsProps {
  segments: ImageSegment[];
  onDitherPatternChange: (segmentId: string, patternId: string) => void;
}

const DITHER_PATTERNS: DitherPattern[] = [
  {
    id: 'dots',
    name: 'Dots',
    svgPattern: `
      <pattern id="dots" patternUnits="userSpaceOnUse" width="8" height="8">
        <circle cx="4" cy="4" r="1" fill="currentColor" opacity="0.8"/>
      </pattern>
    `,
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJkb3RzIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iOCIgaGVpZ2h0PSI4Ij4KICAgICAgPGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9ImN1cnJlbnRDb2xvciIgb3BhY2l0eT0iMC44Ii8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idXJsKCNkb3RzKSIvPgo8L3N2Zz4='
  },
  {
    id: 'lines',
    name: 'Lines',
    svgPattern: `
      <pattern id="lines" patternUnits="userSpaceOnUse" width="4" height="4">
        <path d="M0,4 L4,0" stroke="currentColor" stroke-width="1" opacity="0.6"/>
      </pattern>
    `,
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJsaW5lcyIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQiIGhlaWdodD0iNCI+CiAgICAgIDxwYXRoIGQ9Ik0wLDQgTDQsMCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC42Ii8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idXJsKCNsaW5lcykiLz4KPC9zdmc+'
  },
  {
    id: 'grid',
    name: 'Grid',
    svgPattern: `
      <pattern id="grid" patternUnits="userSpaceOnUse" width="8" height="8">
        <rect x="0" y="0" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>
      </pattern>
    `,
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iOCIgaGVpZ2h0PSI4Ij4KICAgICAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC40Ii8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idXJsKCNncmlkKSIvPgo8L3N2Zz4='
  },
  {
    id: 'crosshatch',
    name: 'Crosshatch',
    svgPattern: `
      <pattern id="crosshatch" patternUnits="userSpaceOnUse" width="6" height="6">
        <path d="M0,0 L6,6 M6,0 L0,6" stroke="currentColor" stroke-width="1" opacity="0.5"/>
      </pattern>
    `,
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJjcm9zc2hhdGNoIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iNiIgaGVpZ2h0PSI2Ij4KICAgICAgPHBhdGggZD0iTTAsMCBMNiw2IE02LDAgTDAsNiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC41Ii8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idXJsKCNjcm9zc2hhdGNoKSIvPgo8L3N2Zz4='
  },
  {
    id: 'waves',
    name: 'Waves',
    svgPattern: `
      <pattern id="waves" patternUnits="userSpaceOnUse" width="12" height="12">
        <path d="M0,6 Q3,0 6,6 T12,6" stroke="currentColor" stroke-width="1" fill="none" opacity="0.6"/>
      </pattern>
    `,
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJ3YXZlcyIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIj4KICAgICAgPHBhdGggZD0iTTAsNiBRMywwIDYsNiBUMTIsNiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC42Ii8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idXJsKCN3YXZlcykiLz4KPC9zdmc+'
  },
  {
    id: 'solid',
    name: 'Solid',
    svgPattern: `
      <pattern id="solid" patternUnits="userSpaceOnUse" width="1" height="1">
        <rect width="1" height="1" fill="currentColor"/>
      </pattern>
    `,
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9ImN1cnJlbnRDb2xvciIvPgo8L3N2Zz4='
  },
];

const DitherPatterns: React.FC<DitherPatternsProps> = ({ segments, onDitherPatternChange }) => {
  return (
    <div>
      <h3 style={{ margin: '2rem 0 1rem 0', color: '#646cff' }}>
        <Palette size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Dither Patterns
      </h3>
      <p style={{ margin: '0 0 1.5rem 0', opacity: 0.8 }}>
        Select dither patterns for each segmented area
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
        </div>
      ))}
    </div>
  );
};

export default DitherPatterns;
