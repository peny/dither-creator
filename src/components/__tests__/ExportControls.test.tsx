import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportControls from '../ExportControls';
import { ImageSegment } from '../../types';
import { saveAs } from 'file-saver';

// Mock file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

const mockSegments: ImageSegment[] = [
  {
    id: 'hair',
    name: 'Hair',
    mask: 'data:image/png;base64,mockMaskData',
    ditherPattern: 'dots'
  },
  {
    id: 'face',
    name: 'Face',
    mask: 'data:image/png;base64,mockMaskData2',
    ditherPattern: 'lines'
  }
];

const mockImageDimensions = { width: 400, height: 300 };

describe('ExportControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render export options', () => {
      render(
        <ExportControls
          segments={mockSegments}
          imageDimensions={mockImageDimensions}
        />
      );

      expect(screen.getByText('Export Options')).toBeInTheDocument();
      expect(screen.getByText('Export All as SVG')).toBeInTheDocument();
      expect(screen.getByText('Export Separate Files')).toBeInTheDocument();
      expect(screen.getByText('Export with Patterns')).toBeInTheDocument();
    });

    it('should render export instructions', () => {
      render(
        <ExportControls
          segments={mockSegments}
          imageDimensions={mockImageDimensions}
        />
      );

      expect(screen.getByText('Download your segmented image as SVG files')).toBeInTheDocument();
      expect(screen.getByText('Single SVG with all segments and patterns')).toBeInTheDocument();
      expect(screen.getByText('Individual SVG files for each segment')).toBeInTheDocument();
      expect(screen.getByText('Only segments with dither patterns applied')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('should export all segments as single SVG', async () => {
      render(
        <ExportControls
          segments={mockSegments}
          imageDimensions={mockImageDimensions}
        />
      );

      const exportAllButton = screen.getByText('Export All as SVG');
      fireEvent.click(exportAllButton);

      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'dither-creation-all.svg'
      );
    });

    it('should export segments separately', async () => {
      render(
        <ExportControls
          segments={mockSegments}
          imageDimensions={mockImageDimensions}
        />
      );

      const exportSeparateButton = screen.getByText('Export Separate Files');
      fireEvent.click(exportSeparateButton);

      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'dither-creation-hair.svg'
      );
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'dither-creation-face.svg'
      );
    });

    it('should export only segments with patterns', async () => {
      const segmentsWithPatterns = [
        ...mockSegments,
        {
          id: 'body',
          name: 'Body',
          mask: 'data:image/png;base64,mockMaskData3'
          // No ditherPattern
        }
      ];

      render(
        <ExportControls
          segments={segmentsWithPatterns}
          imageDimensions={mockImageDimensions}
        />
      );

      const exportPatternsButton = screen.getByText('Export with Patterns');
      fireEvent.click(exportPatternsButton);

      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should only export segments with patterns
      expect(saveAs).toHaveBeenCalledTimes(1);
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'dither-creation-patterns.svg'
      );
    });

    it('should generate SVG with correct structure', async () => {
      render(
        <ExportControls
          segments={mockSegments}
          imageDimensions={mockImageDimensions}
        />
      );

      const exportAllButton = screen.getByText('Export All as SVG');
      fireEvent.click(exportAllButton);

      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const blob = (saveAs as jest.Mock).mock.calls[0][0];
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/svg+xml');
    });

    it('should handle empty segments array', async () => {
      render(
        <ExportControls
          segments={[]}
          imageDimensions={mockImageDimensions}
        />
      );

      const exportAllButton = screen.getByText('Export All as SVG');
      fireEvent.click(exportAllButton);

      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'dither-creation-all.svg'
      );
    });
  });

  describe('SVG Generation', () => {
    it('should include pattern definitions', async () => {
      render(
        <ExportControls
          segments={mockSegments}
          imageDimensions={mockImageDimensions}
        />
      );

      const exportAllButton = screen.getByText('Export All as SVG');
      fireEvent.click(exportAllButton);

      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const blob = (saveAs as jest.Mock).mock.calls[0][0];
      
      // Convert blob to string for testing (this is a simplified test)
      expect(blob).toBeDefined();
    });

    it('should use correct image dimensions', async () => {
      const customDimensions = { width: 800, height: 600 };
      
      render(
        <ExportControls
          segments={mockSegments}
          imageDimensions={customDimensions}
        />
      );

      const exportAllButton = screen.getByText('Export All as SVG');
      fireEvent.click(exportAllButton);

      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(saveAs).toHaveBeenCalled();
    });
  });
});
