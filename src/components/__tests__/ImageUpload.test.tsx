import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUpload from '../ImageUpload';

describe('ImageUpload', () => {
  const mockOnImageUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('File Upload', () => {
    it('should render upload area', () => {
      render(<ImageUpload onImageUpload={mockOnImageUpload} />);
      
      expect(screen.getByText('Upload an Image')).toBeInTheDocument();
      expect(screen.getByText('Drag and drop an image here, or click to select')).toBeInTheDocument();
    });

    it('should handle file selection via click', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onImageUpload={mockOnImageUpload} />);
      
      const uploadArea = screen.getByText('Upload an Image');
      
      // Create a mock file
      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        result: 'data:image/png;base64,mockData',
        onload: null as any
      };
      
      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);
      
      // Mock document.getElementById
      const mockInput = {
        click: jest.fn()
      };
      jest.spyOn(document, 'getElementById').mockReturnValue(mockInput as any);
      
      // Click upload area
      await user.click(uploadArea);
      
      expect(mockInput.click).toHaveBeenCalled();
    });

    it('should reject non-image files', async () => {
      render(<ImageUpload onImageUpload={mockOnImageUpload} />);
      
      // Create a mock file
      const file = new File(['text content'], 'test.txt', { type: 'text/plain' });
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        result: 'data:text/plain;base64,mockData',
        onload: null as any
      };
      
      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);
      
      // Mock alert
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      
      // Simulate file selection
      const input = screen.getByRole('button', { hidden: true });
      fireEvent.change(input, { target: { files: [file] } });
      
      expect(alertSpy).toHaveBeenCalledWith('Please select an image file');
      
      alertSpy.mockRestore();
    });

    it('should handle drag and drop', async () => {
      render(<ImageUpload onImageUpload={mockOnImageUpload} />);
      
      const uploadArea = screen.getByText('Upload an Image').closest('div');
      
      // Create a mock file
      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        result: 'data:image/png;base64,mockData',
        onload: null as any
      };
      
      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);
      
      // Simulate drag and drop
      fireEvent.dragOver(uploadArea!, {
        dataTransfer: {
          files: [file]
        }
      });
      
      fireEvent.drop(uploadArea!, {
        dataTransfer: {
          files: [file]
        }
      });
      
      // Should call onImageUpload
      expect(mockOnImageUpload).toHaveBeenCalled();
    });
  });

  describe('Visual States', () => {
    it('should show drag over state', () => {
      render(<ImageUpload onImageUpload={mockOnImageUpload} />);
      
      const uploadArea = screen.getByText('Upload an Image').closest('div');
      
      fireEvent.dragOver(uploadArea!);
      
      expect(uploadArea).toHaveClass('dragover');
    });

    it('should remove drag over state on drag leave', () => {
      render(<ImageUpload onImageUpload={mockOnImageUpload} />);
      
      const uploadArea = screen.getByText('Upload an Image').closest('div');
      
      fireEvent.dragOver(uploadArea!);
      expect(uploadArea).toHaveClass('dragover');
      
      fireEvent.dragLeave(uploadArea!);
      expect(uploadArea).not.toHaveClass('dragover');
    });
  });
});
