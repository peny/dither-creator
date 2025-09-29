import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../App';

describe('App', () => {
  it('should render the main app', () => {
    render(<App />);
    
    expect(screen.getByText('Dither Creator')).toBeInTheDocument();
    expect(screen.getByText('Upload an image, segment body parts, and export as SVG with dither patterns')).toBeInTheDocument();
  });

  it('should show upload area initially', () => {
    render(<App />);
    
    expect(screen.getByText('Upload an Image')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop an image here, or click to select')).toBeInTheDocument();
  });
});
