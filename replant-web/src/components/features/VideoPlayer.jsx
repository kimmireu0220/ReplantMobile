import React, { useState, useRef } from 'react';
import { tokens } from '../../design/tokens';

const VideoPlayer = ({ videoUrl, onRemove }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const videoRef = useRef(null);

  // 기존 PhotoPreview와 동일한 스타일 패턴
  const containerStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    borderRadius: tokens.borderRadius.md,
    overflow: 'hidden',
    border: `2px solid ${tokens.colors.border.light}`
  };

  const videoStyle = {
    width: '100%',
    height: 'auto',
    display: isLoading ? 'none' : 'block'
  };

  const loadingStyle = {
    width: '100%',
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.background.secondary,
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.fontSize.sm
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
    fontSize: '12px',
    zIndex: 10
  };

  const errorStyle = {
    ...loadingStyle,
    color: tokens.colors.error,
    flexDirection: 'column',
    gap: tokens.spacing[2]
  };

  return (
    <div style={containerStyle}>
      {isLoading && !error && (
        <div style={loadingStyle}>
          <span>영상 로딩 중...</span>
        </div>
      )}
      
      {error && (
        <div style={errorStyle}>
          <span>❌</span>
          <span>영상 로드 실패</span>
          <button 
            onClick={() => {
              setError(false);
              setIsLoading(true);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
            style={{
              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
              borderRadius: tokens.borderRadius.sm,
              border: `1px solid ${tokens.colors.border.light}`,
              backgroundColor: tokens.colors.background.primary,
              color: tokens.colors.text.primary,
              fontSize: tokens.typography.fontSize.xs,
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
        </div>
      )}
      
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        preload="metadata"
        style={videoStyle}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
        onLoadedData={() => setIsLoading(false)}
      />
      
      {onRemove && (
        <button
          onClick={onRemove}
          style={removeButtonStyle}
          title="영상 제거"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
