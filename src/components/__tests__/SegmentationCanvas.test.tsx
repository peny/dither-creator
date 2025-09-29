import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SegmentationCanvas from '../SegmentationCanvas';
import { ImageSegment } from '../../types';

// Mock image data
const mockImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const mockImageDimensions = { width: 400, height: 300 };

const mockSegments: ImageSegment[] = [
  {
    id: 'hair',
    name: 'Hair',
    mask: 'data:image/png;base64,mockMaskData'
  }
];

describe('SegmentationCanvas', () => {
  const mockOnSegmentComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Image Display', () => {
    it('should render without crashing', () => {
      render(
        <SegmentationCanvas
          imageData={mockImageData}
          imageDimensions={mockImageDimensions}
          currentSegment={null}
          segments={[]}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );
      
      expect(screen.getByRole('canvas', { hidden: true })).toBeInTheDocument();
    });

    it('should display image when imageData is provided', async () => {
      render(
        <SegmentationCanvas
          imageData={mockImageData}
          imageDimensions={mockImageDimensions}
          currentSegment={null}
          segments={[]}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );

      // Wait for image to load
      await waitFor(() => {
        const canvas = screen.getByRole('canvas', { hidden: true });
        expect(canvas).toBeInTheDocument();
      });
    });

    it('should handle image load errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(
        <SegmentationCanvas
          imageData="invalid-image-data"
          imageDimensions={mockImageDimensions}
          currentSegment={null}
          segments={[]}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('❌ Failed to load image');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Canvas Functionality', () => {
    it('should create both background and overlay canvases', () => {
      render(
        <SegmentationCanvas
          imageData={mockImageData}
          imageDimensions={mockImageDimensions}
          currentSegment={null}
          segments={[]}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );

      const canvases = screen.getAllByRole('canvas', { hidden: true });
      expect(canvases).toHaveLength(2); // Background + overlay canvas
    });

    it('should set correct canvas dimensions', () => {
      render(
        <SegmentationCanvas
          imageData={mockImageData}
          imageDimensions={mockImageDimensions}
          currentSegment={null}
          segments={[]}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );

      const canvases = screen.getAllByRole('canvas', { hidden: true });
      canvases.forEach(canvas => {
        expect(canvas).toHaveAttribute('width', '400');
        expect(canvas).toHaveAttribute('height', '300');
      });
    });

    it('should scale canvas for large images', () => {
      const largeDimensions = { width: 2000, height: 1500 };
      
      render(
        <SegmentationCanvas
          imageData={mockImageData}
          imageDimensions={largeDimensions}
          currentSegment={null}
          segments={[]}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );

      const canvases = screen.getAllByRole('canvas', { hidden: true });
      // Should be scaled down to max 800x600
      canvases.forEach(canvas => {
        expect(parseInt(canvas.getAttribute('width')!)).toBeLessThanOrEqual(800);
        expect(parseInt(canvas.getAttribute('height')!)).toBeLessThanOrEqual(600);
      });
    });
  });

  describe('Polygon Interaction', () => {
    it('should show crosshair cursor when segment is selected', () => {
      render(
        <SegmentationCanvas
          imageData={mockImageData}
          imageDimensions={mockImageDimensions}
          currentSegment="hair"
          segments={[]}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );

      const overlayCanvas = screen.getAllByRole('canvas', { hidden: true })[1];
      expect(overlayCanvas).toHaveStyle('cursor: crosshair');
    });

    it('should show default cursor when no segment is selected', () => {
      render(
        <SegmentationCanvas
          imageData={mockImageData}
          imageDimensions={mockImageDimensions}
          currentSegment={null}
          segments={[]}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );

      const overlayCanvas = screen.getAllByRole('canvas', { hidden: true })[1];
      expect(overlayCanvas).toHaveStyle('cursor: default');
    });

    it('should display instructions when segment is selected', () => {
      render(
        <SegmentationCanvas
          imageData={mockImageData}
          imageDimensions={mockImageDimensions}
          currentSegment="hair"
          segments={[]}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );

      expect(screen.getByText('Click to add anchor points')).toBeInTheDocument();
    });

    it('should handle canvas clicks when segment is selected', () => {
      render(
        <SegmentationCanvas
          imageData={mockImageData}
          imageDimensions={mockImageDimensions}
          currentSegment="hair"
          segments={[]}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );

      const overlayCanvas = screen.getAllByRole('canvas', { hidden: true })[1];
      
      // Simulate click
      fireEvent.click(overlayCanvas, { clientX: 100, clientY: 100 });
      
      // Should show instruction for adding more points
      expect(screen.getByText(/Click to add more points/)).toBeInTheDocument();
    });
  });

  describe('Existing Segments', () => {
    it('should render existing segments', () => {
      render(
        <SegmentationCanvas
          imageData={mockImageData}
          imageDimensions={mockImageDimensions}
          currentSegment={null}
          segments={mockSegments}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );

      // Canvas should be rendered
      expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(2);
    });

    it('should reset anchor points when segment changes', () => {
      const { rerender } = render(
        <SegmentationCanvas
          imageData={mockImageData}
          imageDimensions={mockImageDimensions}
          currentSegment="hair"
          segments={[]}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );

      // Click to add a point
      const overlayCanvas = screen.getAllByRole('canvas', { hidden: true })[1];
      fireEvent.click(overlayCanvas, { clientX: 100, clientY: 100 });

      // Change segment
      rerender(
        <SegmentationCanvas
          imageData={mockImageData}
          imageDimensions={mockImageDimensions}
          currentSegment="face"
          segments={[]}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );

      // Should show initial instruction again
      expect(screen.getByText('Click to add anchor points')).toBeInTheDocument();
    });
  });

  describe('Segment Completion', () => {
    it('should complete segment when enough points are added', () => {
      render(
        <SegmentationCanvas
          imageData={mockImageData}
          imageDimensions={mockImageDimensions}
          currentSegment="hair"
          segments={[]}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );

      const overlayCanvas = screen.getAllByRole('canvas', { hidden: true })[1];
      
      // Add 3 points (minimum for polygon)
      fireEvent.click(overlayCanvas, { clientX: 100, clientY: 100 });
      fireEvent.click(overlayCanvas, { clientX: 200, clientY: 100 });
      fireEvent.click(overlayCanvas, { clientX: 150, clientY: 200 });
      
      // Double click to complete
      fireEvent.doubleClick(overlayCanvas, { clientX: 150, clientY: 200 });

      expect(mockOnSegmentComplete).toHaveBeenCalledWith({
        id: 'hair',
        name: 'Hair',
        mask: expect.any(String)
      });
    });

    it('should not complete segment with insufficient points', () => {
      render(
        <SegmentationCanvas
          imageData={mockImageData}
          imageDimensions={mockImageDimensions}
          currentSegment="hair"
          segments={[]}
          onSegmentComplete={mockOnSegmentComplete}
        />
      );

      const overlayCanvas = screen.getAllByRole('canvas', { hidden: true })[1];
      
      // Add only 2 points
      fireEvent.click(overlayCanvas, { clientX: 100, clientY: 100 });
      fireEvent.click(overlayCanvas, { clientX: 200, clientY: 100 });
      
      // Double click should not complete
      fireEvent.doubleClick(overlayCanvas, { clientX: 150, clientY: 150 });

      expect(mockOnSegmentComplete).not.toHaveBeenCalled();
    });
  });
});
