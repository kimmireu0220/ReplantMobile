import React, { useState } from 'react';
import { tokens } from '../../design/tokens';

const PhotoPreview = ({ photoUrl, onRemove }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const containerStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '200px',
    borderRadius: tokens.borderRadius.md,
    overflow: 'hidden',
    border: `2px solid ${tokens.colors.border.light}`
  };

  const imageStyle = {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    display: isLoading ? 'none' : 'block'
  };

  const loadingStyle = {
    width: '100%',
    height: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.background.secondary,
    color: tokens.colors.text.secondary
  };

  const removeButtonStyle = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px'
  };

  return (
    <div style={containerStyle}>
      {isLoading && (
        <div style={loadingStyle}>
          <span>로딩 중...</span>
        </div>
      )}
      
      {error && (
        <div style={loadingStyle}>
          <span>이미지 로드 실패</span>
        </div>
      )}
      
      <img
        src={photoUrl}
        alt="미션 사진"
        style={imageStyle}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
      />
      
      {onRemove && (
        <button
          onClick={onRemove}
          style={removeButtonStyle}
          title="사진 제거"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default PhotoPreview;
