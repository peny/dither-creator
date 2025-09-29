// Canvas utility functions for testing
export const createMockCanvas = (width: number = 400, height: number = 300) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export const createMockImageData = (width: number = 400, height: number = 300) => {
  return new ImageData(width, height);
};

export const hasCanvasData = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return Array.from(imageData.data).some(pixel => pixel !== 0);
};

export const simulateImageLoad = (img: HTMLImageElement, width: number = 400, height: number = 300) => {
  // Mock the image dimensions
  Object.defineProperty(img, 'width', { value: width, writable: true });
  Object.defineProperty(img, 'height', { value: height, writable: true });
  
  // Trigger load event
  img.dispatchEvent(new Event('load'));
};

describe('Canvas Utilities', () => {
  describe('createMockCanvas', () => {
    it('should create canvas with default dimensions', () => {
      const canvas = createMockCanvas();
      expect(canvas.width).toBe(400);
      expect(canvas.height).toBe(300);
    });

    it('should create canvas with custom dimensions', () => {
      const canvas = createMockCanvas(800, 600);
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
    });
  });

  describe('hasCanvasData', () => {
    it('should return false for empty canvas', () => {
      const canvas = createMockCanvas();
      expect(hasCanvasData(canvas)).toBe(false);
    });

    it('should return true for canvas with data', () => {
      const canvas = createMockCanvas();
      const ctx = canvas.getContext('2d')!;
      
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 10, 10);
      
      expect(hasCanvasData(canvas)).toBe(true);
    });
  });

  describe('Image Loading', () => {
    it('should simulate image load correctly', () => {
      const img = new Image();
      const loadSpy = jest.fn();
      
      img.addEventListener('load', loadSpy);
      
      simulateImageLoad(img, 500, 400);
      
      expect(loadSpy).toHaveBeenCalled();
      expect(img.width).toBe(500);
      expect(img.height).toBe(400);
    });
  });
});
