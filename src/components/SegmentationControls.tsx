import React from 'react';
import { SegmentType, ImageSegment } from '../types';

interface SegmentationControlsProps {
  segmentTypes: { id: SegmentType; name: string; icon: string }[];
  currentSegment: string | null;
  onSegmentSelect: (segmentType: SegmentType) => void;
  onSegmentHover?: (segmentType: SegmentType | null) => void;
  segments: ImageSegment[];
}

const SegmentationControls: React.FC<SegmentationControlsProps> = ({
  segmentTypes,
  currentSegment,
  onSegmentSelect,
  onSegmentHover,
  segments,
}) => {
  const getSegmentStatus = (segmentType: SegmentType) => {
    const segment = segments.find(s => s.id === segmentType);
    return segment ? 'completed' : 'pending';
  };

  return (
    <div className="segmentation-controls">
      {segmentTypes.map(({ id, name, icon }) => {
        const status = getSegmentStatus(id);
        const isActive = currentSegment === id;
        
        return (
          <button
            key={id}
            className={`segment-button ${isActive ? 'active' : ''} ${status === 'completed' ? 'completed' : ''}`}
            onClick={() => onSegmentSelect(id)}
            onMouseEnter={() => onSegmentHover?.(id)}
            onMouseLeave={() => onSegmentHover?.(null)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: '100px',
              padding: '1rem',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{name}</span>
            {status === 'completed' && (
              <span
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#4ade80',
                  fontWeight: 'bold',
                }}
              >
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentationControls;
