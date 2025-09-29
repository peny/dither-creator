import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SegmentationCanvas from '../SegmentationCanvas';

// Mock image data
const mockImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const mockImageDimensions = { width: 400, height: 300 };

describe('Image Display Tests', () => {
  const mockOnSegmentComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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

    // Should render canvas elements
    const canvases = screen.getAllByRole('canvas', { hidden: true });
    expect(canvases).toHaveLength(2); // Background + overlay canvas
    
    // Should have correct dimensions
    expect(canvases[0]).toHaveAttribute('width', '400');
    expect(canvases[0]).toHaveAttribute('height', '300');
  });

  it('should handle image loading without errors', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(
      <SegmentationCanvas
        imageData={mockImageData}
        imageDimensions={mockImageDimensions}
        currentSegment={null}
        segments={[]}
        onSegmentComplete={mockOnSegmentComplete}
      />
    );

    // Wait for image to load and verify logging
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Image loaded, drawing to canvas')
      );
    });

    consoleSpy.mockRestore();
  });

  it('should scale large images correctly', () => {
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

  it('should show instructions when segment is selected', () => {
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

  it('should handle segment completion', () => {
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
});
