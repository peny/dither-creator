import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (imageData: string, dimensions: { width: number; height: number }) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = canvas.toDataURL('image/png');
        onImageUpload(imageData, { width: img.width, height: img.height });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  return (
    <div>
      <div
        className={`upload-area ${isDragging ? 'dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <Upload size={48} style={{ marginBottom: '1rem', opacity: 0.7 }} />
        <h3 style={{ margin: '0 0 1rem 0' }}>Upload an Image</h3>
        <p style={{ margin: 0, opacity: 0.8 }}>
          Drag and drop an image here, or click to select
        </p>
        <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0 0', opacity: 0.6 }}>
          Supports JPG, PNG, GIF, and other image formats
        </p>
      </div>
      
      <input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default ImageUpload;
