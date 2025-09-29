import React, { forwardRef, useRef, useEffect, useCallback, useState } from 'react';
import { ImageSegment, ClickPoint } from '../types';

interface SegmentationCanvasProps {
  imageData: string;
  imageDimensions: { width: number; height: number };
  currentSegment: string | null;
  hoveredSegment: string | null;
  segments: ImageSegment[];
  onSegmentComplete: (segment: ImageSegment) => void;
}

const SegmentationCanvas = forwardRef<HTMLCanvasElement, SegmentationCanvasProps>(
  ({ imageData, imageDimensions, currentSegment, hoveredSegment, segments, onSegmentComplete }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const [anchorPoints, setAnchorPoints] = useState<ClickPoint[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    // Combine refs
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(canvasRef.current);
      } else if (ref) {
        ref.current = canvasRef.current;
      }
    }, [ref]);

    // Reset anchor points when segment changes
    useEffect(() => {
      setAnchorPoints([]);
      setIsComplete(false);
    }, [currentSegment]);

    // Initialize canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      if (!canvas || !overlayCanvas || !imageData) return;

          const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      
      // Set canvas size to fit in container while maintaining aspect ratio
      const maxWidth = 800;
      const maxHeight = 600;
      
      let displayWidth = imageDimensions.width;
      let displayHeight = imageDimensions.height;
      
      if (displayWidth > maxWidth) {
        displayHeight = (displayHeight * maxWidth) / displayWidth;
        displayWidth = maxWidth;
      }
      
      if (displayHeight > maxHeight) {
        displayWidth = (displayWidth * maxHeight) / displayHeight;
        displayHeight = maxHeight;
      }
      
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      overlayCanvas.width = displayWidth;
      overlayCanvas.height = displayHeight;
      
      // Draw the original image
      const img = new Image();
      img.onload = () => {
        console.log('🖼️ Image loaded, drawing to canvas...', { displayWidth, displayHeight });
        ctx.clearRect(0, 0, displayWidth, displayHeight);
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
        
        // Verify image was drawn
        const imageData = ctx.getImageData(0, 0, displayWidth, displayHeight);
        const hasData = Array.from(imageData.data).some(pixel => pixel !== 0);
        console.log('🖼️ Image drawn successfully:', hasData);
        
        // Draw existing segments directly (hover highlighting will be handled by redrawSegmentsOnly)
        segments.forEach(segment => {
          if (segment.mask) {
            const maskImg = new Image();
            maskImg.onload = () => {
              ctx.save();
              ctx.globalAlpha = 0.3;
              ctx.globalCompositeOperation = 'source-over';
              ctx.fillStyle = getSegmentColor(segment.id);
              ctx.drawImage(maskImg, 0, 0, displayWidth, displayHeight);
              ctx.restore();
            };
            maskImg.src = segment.mask;
          }
        });
      };
      img.onerror = () => {
        console.error('❌ Failed to load image');
      };
      img.src = imageData;
    }, [imageData, imageDimensions]);

    const getSegmentColor = (segmentId: string) => {
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

    // This will be moved after drawCurrentPolygon is defined


    const drawCurrentPolygon = useCallback(() => {
      const overlayCanvas = overlayCanvasRef.current;
      if (!overlayCanvas) return;

      const ctx = overlayCanvas.getContext('2d')!;
      
      // Clear overlay canvas
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      
      if (currentSegment && anchorPoints.length > 0) {
        ctx.strokeStyle = getSegmentColor(currentSegment);
        ctx.fillStyle = getSegmentColor(currentSegment);
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        
        // Draw polygon lines
        ctx.beginPath();
        anchorPoints.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        
        // If we have enough points, close the polygon
        if (anchorPoints.length >= 3) {
          ctx.closePath();
          ctx.fill();
        }
        
        ctx.stroke();
        
        // Draw anchor points
        anchorPoints.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.strokeStyle = getSegmentColor(currentSegment);
          ctx.stroke();
        });
        
        ctx.globalAlpha = 1;
      }
    }, [anchorPoints, currentSegment]);

    // Draw current polygon when anchor points change
    useEffect(() => {
      drawCurrentPolygon();
    }, [anchorPoints, drawCurrentPolygon]);

    // Store the base image to avoid reloading on every hover
    const baseImageRef = useRef<HTMLImageElement | null>(null);
    const [baseImageLoaded, setBaseImageLoaded] = useState(false);

    // Load and cache the base image
    useEffect(() => {
      if (!imageData) return;
      
      const img = new Image();
      img.onload = () => {
        baseImageRef.current = img;
        setBaseImageLoaded(true);
      };
      img.src = imageData;
    }, [imageData]);

    // Efficient function to redraw only segments without reloading image
    const redrawSegmentsOnly = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || !baseImageRef.current || !baseImageLoaded) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      const displayWidth = canvas.width;
      const displayHeight = canvas.height;

      // Clear canvas and redraw base image from cache
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      ctx.drawImage(baseImageRef.current, 0, 0, displayWidth, displayHeight);
      
      // Draw existing segments with hover highlighting
      segments.forEach(segment => {
        if (segment.mask) {
          const maskImg = new Image();
          maskImg.onload = () => {
            ctx.save();
            
            // Highlight hovered segment with different alpha and color
            if (hoveredSegment === segment.id) {
              ctx.globalAlpha = 0.6;
              ctx.globalCompositeOperation = 'source-over';
              ctx.fillStyle = '#3b82f6'; // Blue highlight
            } else {
              ctx.globalAlpha = 0.3;
              ctx.globalCompositeOperation = 'source-over';
              ctx.fillStyle = getSegmentColor(segment.id);
            }
            
            ctx.drawImage(maskImg, 0, 0, displayWidth, displayHeight);
            ctx.restore();
          };
          maskImg.src = segment.mask;
        }
      });
    }, [segments, hoveredSegment, baseImageLoaded]);

    // Redraw segments when hover state changes (debounced to prevent flickering)
    useEffect(() => {
      if (!baseImageLoaded) return;
      
      const timeoutId = setTimeout(() => {
        redrawSegmentsOnly();
      }, 16); // ~60fps debouncing

      return () => clearTimeout(timeoutId);
    }, [hoveredSegment, redrawSegmentsOnly, baseImageLoaded]);


    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
      if (!currentSegment || isComplete) return;

      const overlayCanvas = overlayCanvasRef.current;
      if (!overlayCanvas) return;

      const rect = overlayCanvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * overlayCanvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * overlayCanvas.height;

      // Check if clicking on first point to close polygon
      if (anchorPoints.length >= 3) {
        const firstPoint = anchorPoints[0];
        const distance = Math.sqrt((x - firstPoint.x) ** 2 + (y - firstPoint.y) ** 2);
        if (distance < 15) {
          // Close polygon
          setIsComplete(true);
          generateSegmentFromPolygon();
          return;
        }
      }

      // Add new anchor point
      setAnchorPoints(prev => [...prev, { x, y, type: 'include' }]);
    }, [currentSegment, anchorPoints, isComplete]);

    const handleDoubleClick = useCallback((_e: React.MouseEvent) => {
      if (!currentSegment || anchorPoints.length < 3) return;
      
      // Double click to complete polygon
      setIsComplete(true);
      generateSegmentFromPolygon();
    }, [currentSegment, anchorPoints]);

    const generateSegmentFromPolygon = useCallback(() => {
      if (!currentSegment || anchorPoints.length < 3) return;

      // Generate mask from polygon
      const mask = generateMaskFromPolygon(anchorPoints);
      
      // Generate SVG path from polygon points
      const svgPath = generateSVGPathFromPolygon(anchorPoints);
      
      // Create segment
      const segment: ImageSegment = {
        id: currentSegment,
        name: currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1),
        mask: mask,
        svgPath: svgPath,
      };

      onSegmentComplete(segment);
      setAnchorPoints([]);
      setIsComplete(false);
    }, [currentSegment, anchorPoints, onSegmentComplete]);

    const generateSVGPathFromPolygon = (points: ClickPoint[]): string => {
      if (points.length < 3) return 'M0,0 Z';
      
      // Create SVG path from polygon points
      let path = '';
      points.forEach((point, index) => {
        if (index === 0) {
          path += `M${point.x},${point.y}`;
        } else {
          path += ` L${point.x},${point.y}`;
        }
      });
      path += ' Z'; // Close the path
      
      return path;
    };

    const generateMaskFromPolygon = (points: ClickPoint[]): string => {
      const canvas = canvasRef.current;
      if (!canvas) return '';

      // Create a temporary canvas for the mask
      const maskCanvas = document.createElement('canvas');
      const maskCtx = maskCanvas.getContext('2d')!;
      
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      
      // Fill the polygon
      maskCtx.fillStyle = 'white';
      maskCtx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) {
          maskCtx.moveTo(point.x, point.y);
        } else {
          maskCtx.lineTo(point.x, point.y);
        }
      });
      maskCtx.closePath();
      maskCtx.fill();
      
      return maskCanvas.toDataURL('image/png');
    };

    return (
      <div className="canvas-container" style={{ position: 'relative', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          style={{
            position: 'relative',
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
          }}
        />
        <canvas
          ref={overlayCanvasRef}
          onClick={handleCanvasClick}
          onDoubleClick={handleDoubleClick}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            cursor: currentSegment && !isComplete ? 'crosshair' : 'default',
            maxWidth: '100%',
            height: 'auto',
            pointerEvents: currentSegment ? 'auto' : 'none',
            zIndex: 1,
          }}
        />
        {currentSegment && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '0.9rem',
            zIndex: 10,
          }}>
            {anchorPoints.length === 0 && 'Click to add anchor points'}
            {anchorPoints.length > 0 && anchorPoints.length < 3 && `Click to add more points (${anchorPoints.length}/3 minimum)`}
            {anchorPoints.length >= 3 && !isComplete && 'Click on first point or double-click to complete'}
          </div>
        )}
      </div>
    );
  }
);

SegmentationCanvas.displayName = 'SegmentationCanvas';

export default SegmentationCanvas;
