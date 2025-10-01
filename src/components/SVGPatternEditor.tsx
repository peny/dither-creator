import React, { useState, useCallback } from 'react';
import { Palette, Move, RotateCcw, Download } from 'lucide-react';
import { UploadedSVG, DitherPattern } from '../types';
import { saveAs } from 'file-saver';

interface SVGPatternEditorProps {
  uploadedSVG: UploadedSVG;
  onSVGUpdate: (updatedSVG: UploadedSVG) => void;
}

// Asset-based dither patterns (same as in DitherPatterns.tsx)
const DITHER_PATTERNS: DitherPattern[] = [
  {
    id: 'dithered_marble_1',
    name: 'Marble 1',
    svgPattern: '',
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
  {
    id: 'dots',
    name: 'Dots',
    svgPattern: `
      <pattern id="dots" patternUnits="userSpaceOnUse" width="8" height="8">
        <circle cx="4" cy="4" r="1" fill="currentColor" opacity="0.8"/>
      </pattern>
    `,
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJkb3RzIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iOCIgaGVpZ2h0PSI4Ij4KICAgICAgPGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9ImN1cnJlbnRDb2xvciIgb3BhY2l0eT0iMC44Ii8+CiAgICA8L2xwYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9InVybCgjZG90cykiLz4KPC9zdmc=',
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
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9ImN1cnJlbnRDb2xvciIvPgo8L2x2Zz4=',
    type: 'svg',
  },
];

// Generate SVG pattern definition for different pattern types (same logic as ExportControls)
const generatePatternDef = (patternId: string, offset: { x: number; y: number } = { x: 0, y: 0 }, svgDimensions: { width: number; height: number }): string => {
  const offsetX = offset.x;
  const offsetY = offset.y;

  // Smart scaling: ensure patterns are large enough to prevent white lines/gaps
  const basePatternSize = 256; // Larger base size for better coverage
  const maxSvgDimension = Math.max(svgDimensions.width, svgDimensions.height);
  const scaleFactor = Math.min(maxSvgDimension / 300, 4); // Scale up to 4x for better coverage
  const patternSize = Math.round(basePatternSize * scaleFactor);

  switch (patternId) {
    case 'dithered_marble_1':
      return `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${patternSize}" height="${patternSize}" 
                 patternTransform="translate(${offsetX},${offsetY})" patternContentUnits="userSpaceOnUse">
          <image href="/assets/dithered_marble_1.png" width="${patternSize}" height="${patternSize}" preserveAspectRatio="none"/>
        </pattern>
      `;
    case 'dithered_marble_2':
      return `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${patternSize}" height="${patternSize}" 
                 patternTransform="translate(${offsetX},${offsetY})" patternContentUnits="userSpaceOnUse">
          <image href="/assets/dithered_marble_2.png" width="${patternSize}" height="${patternSize}" preserveAspectRatio="none"/>
        </pattern>
      `;
    case 'dithered_nest':
      return `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${patternSize}" height="${patternSize}" 
                 patternTransform="translate(${offsetX},${offsetY})" patternContentUnits="userSpaceOnUse">
          <image href="/assets/dithered_nest.png" width="${patternSize}" height="${patternSize}" preserveAspectRatio="none"/>
        </pattern>
      `;
    case 'dots':
      const dotSize = Math.max(12, Math.min(48, Math.min(svgDimensions.width, svgDimensions.height) / 15));
      return `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${dotSize}" height="${dotSize}" 
                 patternTransform="translate(${offsetX},${offsetY})">
          <circle cx="${dotSize/2}" cy="${dotSize/2}" r="${dotSize/8}" fill="currentColor" opacity="0.8"/>
        </pattern>
      `;
    case 'solid':
      return `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="1" height="1" 
                 patternTransform="translate(${offsetX},${offsetY})">
          <rect width="1" height="1" fill="currentColor"/>
        </pattern>
      `;
    default:
      const defaultSize = Math.max(12, Math.min(48, Math.min(svgDimensions.width, svgDimensions.height) / 15));
      return `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${defaultSize}" height="${defaultSize}" 
                 patternTransform="translate(${offsetX},${offsetY})">
          <rect width="${defaultSize}" height="${defaultSize}" fill="currentColor" opacity="0.3"/>
        </pattern>
      `;
  }
};

// Parse SVG to extract paths and dimensions
const parseSVG = (svgContent: string) => {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = svgDoc.querySelector('svg');
  
  if (!svgElement) return { paths: [], width: 0, height: 0 };

  const width = parseInt(svgElement.getAttribute('width') || '0');
  const height = parseInt(svgElement.getAttribute('height') || '0');
  
  const paths = Array.from(svgElement.querySelectorAll('path')).map((path, index) => ({
    id: `path-${index}`,
    d: path.getAttribute('d') || '',
    fill: path.getAttribute('fill') || '#000000',
    stroke: path.getAttribute('stroke') || '#000000',
    strokeWidth: path.getAttribute('stroke-width') || '2',
    dataSegment: path.getAttribute('data-segment') || `segment-${index}`,
  }));

  return { paths, width, height };
};

const SVGPatternEditor: React.FC<SVGPatternEditorProps> = ({ uploadedSVG, onSVGUpdate }) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [pathPatterns, setPathPatterns] = useState<Record<string, string>>({});
  const [pathOffsets, setPathOffsets] = useState<Record<string, { x: number; y: number }>>({});

  const parsedSVG = parseSVG(uploadedSVG.content);

  const handlePatternChange = (pathId: string, patternId: string) => {
    setPathPatterns(prev => ({
      ...prev,
      [pathId]: patternId,
    }));
  };

  const handleOffsetChange = (pathId: string, field: 'x' | 'y', value: number) => {
    setPathOffsets(prev => ({
      ...prev,
      [pathId]: {
        ...prev[pathId],
        [field]: value,
      },
    }));
  };

  const resetOffset = (pathId: string) => {
    setPathOffsets(prev => ({
      ...prev,
      [pathId]: { x: 0, y: 0 },
    }));
  };

  const generatePatternedSVG = useCallback(() => {
    const { paths, width, height } = parsedSVG;
    
    // Generate pattern definitions for all used patterns
    const usedPatterns = new Set(Object.values(pathPatterns));
    const patternDefs = Array.from(usedPatterns)
      .map(patternId => {
        const pathId = Object.keys(pathPatterns).find(id => pathPatterns[id] === patternId);
        const offset = pathOffsets[pathId || ''] || { x: 0, y: 0 };
        return generatePatternDef(patternId, offset, { width, height });
      })
      .join('\n');

    // Generate paths with patterns applied
    const patternedPaths = paths.map(path => {
      const patternId = pathPatterns[path.id];
      const fill = patternId ? `url(#${patternId})` : path.fill;
      
      return `
        <g color="${path.stroke}">
          <path
            d="${path.d}"
            fill="${fill}"
            stroke="${path.stroke}"
            stroke-width="${path.strokeWidth}"
            data-segment="${path.dataSegment}"
          />
        </g>
      `;
    }).join('\n');

    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${patternDefs}
        </defs>
        <rect width="100%" height="100%" fill="white"/>
        ${patternedPaths}
      </svg>
    `;

    return svg;
  }, [parsedSVG, pathPatterns, pathOffsets]);

  const handleDownload = () => {
    const patternedSVG = generatePatternedSVG();
    const blob = new Blob([patternedSVG], { type: 'image/svg+xml' });
    saveAs(blob, `${uploadedSVG.name.replace('.svg', '')}-patterned.svg`);
  };

  const handlePreview = () => {
    const patternedSVG = generatePatternedSVG();
    
    // Create a new window/tab with the SVG
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(patternedSVG);
      newWindow.document.close();
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#646cff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Palette size={20} />
        Apply Dither Patterns to {uploadedSVG.name}
      </h3>

      {/* SVG Preview */}
      <div style={{ marginBottom: '2rem', border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', backgroundColor: '#f9f9f9' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Original SVG:</h4>
        <div
          style={{
            maxHeight: '300px',
            overflow: 'auto',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            padding: '1rem',
          }}
          dangerouslySetInnerHTML={{ __html: uploadedSVG.content }}
        />
      </div>

      {/* Path Selection and Pattern Application */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Select paths and apply patterns:</h4>
        
        {parsedSVG.paths.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No paths found in this SVG.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {parsedSVG.paths.map((path) => (
              <div
                key={path.id}
                style={{
                  border: `2px solid ${selectedPath === path.id ? '#646cff' : '#ddd'}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: selectedPath === path.id ? '#f0f0ff' : 'white',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedPath(path.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                    {path.dataSegment} (Path {path.id})
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>
                    {path.fill} / {path.stroke}
                  </span>
                </div>

                {selectedPath === path.id && (
                  <div style={{ marginTop: '1rem' }}>
                    {/* Pattern Selection */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                        Select Dither Pattern:
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {DITHER_PATTERNS.map((pattern) => (
                          <button
                            key={pattern.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePatternChange(path.id, pattern.id);
                            }}
                            style={{
                              padding: '0.5rem',
                              border: `2px solid ${pathPatterns[path.id] === pattern.id ? '#646cff' : '#ddd'}`,
                              borderRadius: '6px',
                              backgroundColor: pathPatterns[path.id] === pattern.id ? '#f0f0ff' : 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '0.25rem',
                              minWidth: '80px',
                            }}
                          >
                            <img
                              src={pattern.preview}
                              alt={pattern.name}
                              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                            />
                            <span style={{ fontSize: '0.7rem', textAlign: 'center' }}>{pattern.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pattern Offset Controls */}
                    {pathPatterns[path.id] && (
                      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Move size={16} />
                          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Pattern Offset</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              resetOffset(path.id);
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.7rem',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
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
                              value={pathOffsets[path.id]?.x || 0}
                              onChange={(e) => handleOffsetChange(path.id, 'x', parseInt(e.target.value) || 0)}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: '60px',
                                padding: '0.25rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                              }}
                            />
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>Y:</label>
                            <input
                              type="number"
                              value={pathOffsets[path.id]?.y || 0}
                              onChange={(e) => handleOffsetChange(path.id, 'y', parseInt(e.target.value) || 0)}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: '60px',
                                padding: '0.25rem',
                                border: '1px solid #ccc',
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Controls */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={handlePreview}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#646cff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '500',
          }}
        >
          <Palette size={16} />
          Preview Patterned SVG
        </button>

        <button
          onClick={handleDownload}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '500',
          }}
        >
          <Download size={16} />
          Download Patterned SVG
        </button>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
        <p>💡 <strong>Instructions:</strong></p>
        <ul style={{ margin: '0.5rem 0 0 1rem' }}>
          <li>Click on any path above to select it</li>
          <li>Choose a dither pattern from the options</li>
          <li>Adjust the pattern offset if needed</li>
          <li>Preview or download the result</li>
        </ul>
      </div>
    </div>
  );
};

export default SVGPatternEditor;
