import React, { useCallback } from 'react';
import { Download, Scissors, Palette } from 'lucide-react';
import { ImageSegment, DitherPattern } from '../types';
import { saveAs } from 'file-saver';

interface ExportControlsProps {
  segments: ImageSegment[];
  imageDimensions: { width: number; height: number };
}

const DITHER_PATTERNS: Record<string, string> = {
  dots: `
    <pattern id="dots" patternUnits="userSpaceOnUse" width="8" height="8">
      <circle cx="4" cy="4" r="1" fill="currentColor" opacity="0.8"/>
    </pattern>
  `,
  lines: `
    <pattern id="lines" patternUnits="userSpaceOnUse" width="4" height="4">
      <path d="M0,4 L4,0" stroke="currentColor" stroke-width="1" opacity="0.6"/>
    </pattern>
  `,
  grid: `
    <pattern id="grid" patternUnits="userSpaceOnUse" width="8" height="8">
      <rect x="0" y="0" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>
    </pattern>
  `,
  crosshatch: `
    <pattern id="crosshatch" patternUnits="userSpaceOnUse" width="6" height="6">
      <path d="M0,0 L6,6 M6,0 L0,6" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    </pattern>
  `,
  waves: `
    <pattern id="waves" patternUnits="userSpaceOnUse" width="12" height="12">
      <path d="M0,6 Q3,0 6,6 T12,6" stroke="currentColor" stroke-width="1" fill="none" opacity="0.6"/>
    </pattern>
  `,
  solid: `
    <pattern id="solid" patternUnits="userSpaceOnUse" width="1" height="1">
      <rect width="1" height="1" fill="currentColor"/>
    </pattern>
  `,
};

const ExportControls: React.FC<ExportControlsProps> = ({ segments, imageDimensions }) => {
  const generateSVG = useCallback(async (segments: ImageSegment[], includeAll: boolean = true) => {
    const svgWidth = imageDimensions.width;
    const svgHeight = imageDimensions.height;
    
    // Get unique patterns used
    const usedPatterns = new Set(
      segments
        .filter(segment => segment.ditherPattern)
        .map(segment => segment.ditherPattern!)
    );

    const patternDefs = Array.from(usedPatterns)
      .map(patternId => DITHER_PATTERNS[patternId] || '')
      .join('\n');

    // Generate paths for all segments asynchronously
    const segmentPathsPromises = segments
      .filter(segment => includeAll || segment.ditherPattern)
      .map(async (segment) => {
        const patternId = segment.ditherPattern || 'solid';
        const color = getSegmentColor(segment.id);
        
        const pathData = segment.svgPath || await generatePathFromMask(segment.mask);
        
        return `
          <g color="${color}">
            <path 
              d="${pathData}" 
              fill="url(#${patternId})" 
              stroke="${color}" 
              stroke-width="2"
              data-segment="${segment.id}"
            />
          </g>
        `;
      });

    const segmentPaths = await Promise.all(segmentPathsPromises);
    const segmentPathsString = segmentPaths.join('\n');

    const svg = `
      <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${patternDefs}
        </defs>
        <rect width="100%" height="100%" fill="white"/>
        ${segmentPathsString}
      </svg>
    `;

    return svg;
  }, [imageDimensions]);

  const generatePathFromMask = (maskData: string): Promise<string> => {
    return new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('M0,0 Z');
        return;
      }
      
      canvas.width = imageDimensions.width;
      canvas.height = imageDimensions.height;
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Find edge pixels to create a more accurate path
        const edgePixels: {x: number, y: number}[] = [];
        
        for (let y = 1; y < canvas.height - 1; y++) {
          for (let x = 1; x < canvas.width - 1; x++) {
            const index = (y * canvas.width + x) * 4;
            const alpha = data[index + 3];
            
            if (alpha > 0) {
              // Check if this pixel is on an edge (has at least one transparent neighbor)
              const isEdge = (
                data[((y-1) * canvas.width + x) * 4 + 3] === 0 || // top
                data[((y+1) * canvas.width + x) * 4 + 3] === 0 || // bottom
                data[(y * canvas.width + (x-1)) * 4 + 3] === 0 || // left
                data[(y * canvas.width + (x+1)) * 4 + 3] === 0    // right
              );
              
              if (isEdge) {
                edgePixels.push({ x, y });
              }
            }
          }
        }
        
        if (edgePixels.length === 0) {
          resolve('M0,0 Z');
          return;
        }
        
        // Create a simplified path by finding the convex hull or using a simplified polygon
        // For now, create a path that follows the outer edge pixels
        const path = createPathFromEdgePixels(edgePixels);
        resolve(path);
      };
      
      img.onerror = () => resolve('M0,0 Z');
      img.src = maskData;
    });
  };

  const createPathFromEdgePixels = (edgePixels: {x: number, y: number}[]): string => {
    if (edgePixels.length === 0) return 'M0,0 Z';
    
    // Find the convex hull or create a simplified polygon
    // For simplicity, we'll create a polygon that encompasses most of the edge pixels
    
    // Find bounding box
    const xs = edgePixels.map(p => p.x);
    const ys = edgePixels.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    // Create a simplified path with rounded corners
    const padding = 2;
    const cornerRadius = 5;
    
    const path = `M${minX - padding},${minY + cornerRadius - padding} 
                  Q${minX - padding},${minY - padding} ${minX + cornerRadius - padding},${minY - padding}
                  L${maxX - cornerRadius + padding},${minY - padding}
                  Q${maxX + padding},${minY - padding} ${maxX + padding},${minY + cornerRadius - padding}
                  L${maxX + padding},${maxY - cornerRadius + padding}
                  Q${maxX + padding},${maxY + padding} ${maxX - cornerRadius + padding},${maxY + padding}
                  L${minX + cornerRadius - padding},${maxY + padding}
                  Q${minX - padding},${maxY + padding} ${minX - padding},${maxY - cornerRadius + padding}
                  Z`;
    
    return path.replace(/\s+/g, ' ').trim();
  };

  const getSegmentColor = (segmentId: string): string => {
    const colors = {
      hair: '#ff6b6b',
      face: '#4ecdc4',
      body: '#45b7d1',
      arms: '#96ceb4',
      legs: '#feca57',
      accessories: '#ff9ff3',
      background: '#a4b0be',
    };
    return colors[segmentId as keyof typeof colors] || '#888';
  };

  const exportAllAsSVG = useCallback(async () => {
    try {
      const svg = await generateSVG(segments, true);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      saveAs(blob, 'dither-creation-all.svg');
    } catch (error) {
      console.error('Error exporting SVG:', error);
    }
  }, [segments, generateSVG]);

  const exportSegmentsSeparately = useCallback(async () => {
    try {
      for (const segment of segments) {
        const svg = await generateSVG([segment], true); // Use includeAll=true to export all segments
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        saveAs(blob, `dither-creation-${segment.id}.svg`);
      }
    } catch (error) {
      console.error('Error exporting separate SVGs:', error);
    }
  }, [segments, generateSVG]);

  const exportWithPatternsOnly = useCallback(async () => {
    try {
      const segmentsWithPatterns = segments.filter(segment => segment.ditherPattern);
      const svg = await generateSVG(segmentsWithPatterns, false);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      saveAs(blob, 'dither-creation-patterns.svg');
    } catch (error) {
      console.error('Error exporting patterns SVG:', error);
    }
  }, [segments, generateSVG]);

  return (
    <div>
      <h3 style={{ margin: '2rem 0 1rem 0', color: '#646cff' }}>
        <Download size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Export Options
      </h3>
      <p style={{ margin: '0 0 1.5rem 0', opacity: 0.8 }}>
        Download your segmented image as SVG files
      </p>
      
      <div className="export-controls">
        <button
          onClick={exportAllAsSVG}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#646cff',
            color: 'white',
            padding: '1rem 1.5rem',
          }}
        >
          <Download size={18} />
          Export All as SVG
        </button>
        
        <button
          onClick={exportSegmentsSeparately}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#4ade80',
            color: 'white',
            padding: '1rem 1.5rem',
          }}
        >
          <Scissors size={18} />
          Export Separate Files
        </button>
        
        <button
          onClick={exportWithPatternsOnly}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#f59e0b',
            color: 'white',
            padding: '1rem 1.5rem',
          }}
        >
          <Palette size={18} />
          Export with Patterns
        </button>
      </div>
      
      <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
        <p>
          <strong>Export All:</strong> Single SVG with all segments and patterns
        </p>
        <p>
          <strong>Export Separate:</strong> Individual SVG files for each segment
        </p>
        <p>
          <strong>Export with Patterns:</strong> Only segments with dither patterns applied
        </p>
      </div>
    </div>
  );
};

export default ExportControls;
