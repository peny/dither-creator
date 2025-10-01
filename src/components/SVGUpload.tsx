import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { UploadedSVG } from '../types';

interface SVGUploadProps {
  onSVGUpload: (svg: UploadedSVG) => void;
  uploadedSVGs: UploadedSVG[];
  onSVGSelect: (svg: UploadedSVG) => void;
  selectedSVG: UploadedSVG | null;
  onSVGDelete: (svgId: string) => void;
}

const SVGUpload: React.FC<SVGUploadProps> = ({
  onSVGUpload,
  uploadedSVGs,
  onSVGSelect,
  selectedSVG,
  onSVGDelete,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const svg: UploadedSVG = {
            id: `svg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            content,
            uploadedAt: new Date(),
          };
          onSVGUpload(svg);
        };
        reader.readAsText(file);
      }
    });
  }, [onSVGUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    e.target.value = ''; // Reset input
  }, [handleFileUpload]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h3 style={{ margin: '2rem 0 1rem 0', color: '#646cff' }}>
        <FileText size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        SVG Upload
      </h3>
      <p style={{ margin: '0 0 1.5rem 0', opacity: 0.8 }}>
        Upload generated SVG files to apply new dither patterns
      </p>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('svg-file-input')?.click()}
        style={{
          border: `2px dashed ${isDragOver ? '#646cff' : '#ddd'}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragOver ? '#f0f4ff' : '#fafafa',
          transition: 'all 0.2s ease',
          marginBottom: '2rem',
        }}
      >
        <Upload size={48} style={{ color: isDragOver ? '#646cff' : '#999', marginBottom: '1rem' }} />
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: isDragOver ? '#646cff' : '#333' }}>
          {isDragOver ? 'Drop SVG files here' : 'Drag and drop SVG files here, or click to select'}
        </p>
        <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
          Supports SVG files (.svg)
        </p>
        
        <input
          id="svg-file-input"
          type="file"
          multiple
          accept=".svg,image/svg+xml"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Uploaded SVGs List */}
      {uploadedSVGs.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 1rem 0', color: '#888' }}>Uploaded SVGs</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {uploadedSVGs.map(svg => (
              <div
                key={svg.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: selectedSVG?.id === svg.id ? '#646cff' : '#f5f5f5',
                  color: selectedSVG?.id === svg.id ? 'white' : '#333',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: '1px solid #ddd',
                }}
                onClick={() => onSVGSelect(svg)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} />
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{svg.name}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                      {formatDate(svg.uploadedAt)}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSVGDelete(svg.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: selectedSVG?.id === svg.id ? 'white' : '#666',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Delete SVG"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected SVG Info */}
      {selectedSVG && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f4ff', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#646cff' }}>Selected SVG: {selectedSVG.name}</h4>
          <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
            Uploaded: {formatDate(selectedSVG.uploadedAt)}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#888' }}>
            You can now apply dither patterns to this SVG using the pattern controls below.
          </p>
        </div>
      )}
    </div>
  );
};

export default SVGUpload;
