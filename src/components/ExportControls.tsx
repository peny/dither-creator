import React, { useCallback, useState } from 'react';
import { Download, Scissors, Palette, Eye, X } from 'lucide-react';
import { ImageSegment } from '../types';
import { saveAs } from 'file-saver';

interface ExportControlsProps {
  segments: ImageSegment[];
  imageDimensions: { width: number; height: number };
}

// Generate SVG pattern definition for different pattern types
const generatePatternDef = (patternId: string, offset: { x: number; y: number } = { x: 0, y: 0 }, imageDimensions: { width: number; height: number }): string => {
  const offsetX = offset.x;
  const offsetY = offset.y;

  // Smart scaling: maintain pattern detail while preventing unwanted repetition
  // For image-based patterns, use a reasonable base size that scales with image but maintains quality
  const basePatternSize = 128; // Higher resolution base
  const maxImageDimension = Math.max(imageDimensions.width, imageDimensions.height);
  const scaleFactor = Math.min(maxImageDimension / 400, 3); // Scale up to 3x for large images
  const patternSize = Math.round(basePatternSize * scaleFactor);

  switch (patternId) {
    case 'dithered_marble_1':
      return `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${patternSize}" height="${patternSize}" 
                 patternTransform="translate(${offsetX},${offsetY})">
          <image href="/assets/dithered_marble_1.png" width="${patternSize}" height="${patternSize}" preserveAspectRatio="xMidYMid"/>
        </pattern>
      `;
    case 'dithered_marble_2':
      return `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${patternSize}" height="${patternSize}" 
                 patternTransform="translate(${offsetX},${offsetY})">
          <image href="/assets/dithered_marble_2.png" width="${patternSize}" height="${patternSize}" preserveAspectRatio="xMidYMid"/>
        </pattern>
      `;
    case 'dithered_nest':
      return `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${patternSize}" height="${patternSize}" 
                 patternTransform="translate(${offsetX},${offsetY})">
          <image href="/assets/dithered_nest.png" width="${patternSize}" height="${patternSize}" preserveAspectRatio="xMidYMid"/>
        </pattern>
      `;
    case 'dots':
      // Scale dots pattern based on image size but maintain reasonable size
      const dotSize = Math.max(12, Math.min(48, Math.min(imageDimensions.width, imageDimensions.height) / 15));
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
      const defaultSize = Math.max(12, Math.min(48, Math.min(imageDimensions.width, imageDimensions.height) / 15));
      return `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${defaultSize}" height="${defaultSize}" 
                 patternTransform="translate(${offsetX},${offsetY})">
          <rect width="${defaultSize}" height="${defaultSize}" fill="currentColor" opacity="0.3"/>
        </pattern>
      `;
  }
};

const ExportControls: React.FC<ExportControlsProps> = ({ segments, imageDimensions }) => {
  const [previewSVG, setPreviewSVG] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'all' | 'separate' | 'patterns'>('all');
  const generateSVG = useCallback(async (segments: ImageSegment[], includeAll: boolean = true) => {
    const svgWidth = imageDimensions.width;
    const svgHeight = imageDimensions.height;
    
    // Note: We now generate patterns dynamically with offsets, so we don't need to track unique patterns

    // Generate pattern definitions with offsets
    const patternDefs = segments
      .filter(segment => segment.ditherPattern)
      .map(segment => {
        const patternId = segment.ditherPattern!;
        const offset = segment.patternOffset || { x: 0, y: 0 };
        return generatePatternDef(patternId, offset, imageDimensions);
      })
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

  const previewSVGContent = useCallback(async (mode: 'all' | 'separate' | 'patterns') => {
    try {
      let svg: string;
      
      if (mode === 'separate') {
        // For separate preview, show all segments individually
        svg = await generateSVG(segments, true);
      } else if (mode === 'patterns') {
        // For patterns preview, only show segments with patterns
        svg = await generateSVG(segments, false);
      } else {
        // For all preview, show everything
        svg = await generateSVG(segments, true);
      }
      
      setPreviewSVG(svg);
      setPreviewMode(mode);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  }, [segments, generateSVG]);

  const closePreview = () => {
    setShowPreview(false);
    setPreviewSVG('');
  };

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

      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => previewSVGContent('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#8b5cf6',
            color: 'white',
            padding: '0.75rem 1rem',
            fontSize: '0.9rem',
          }}
        >
          <Eye size={16} />
          Preview All
        </button>
        
        <button
          onClick={() => previewSVGContent('patterns')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#ec4899',
            color: 'white',
            padding: '0.75rem 1rem',
            fontSize: '0.9rem',
          }}
        >
          <Eye size={16} />
          Preview Patterns
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

      {/* Preview Modal */}
      {showPreview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem',
          }}
          onClick={closePreview}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: '2rem',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePreview}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666',
              }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ margin: '0 0 1rem 0', color: '#646cff' }}>
              SVG Preview {previewMode === 'all' ? '(All Segments)' : previewMode === 'patterns' ? '(With Patterns)' : '(Separate)'}
            </h3>
            
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '1rem',
                background: '#f9f9f9',
                maxWidth: '100%',
                overflow: 'auto',
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: previewSVG }}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
            </div>
            
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  const blob = new Blob([previewSVG], { type: 'image/svg+xml' });
                  saveAs(blob, `preview-${previewMode}.svg`);
                }}
                style={{
                  background: '#646cff',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Download size={16} />
                Download Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportControls;
