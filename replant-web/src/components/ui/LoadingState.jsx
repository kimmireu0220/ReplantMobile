import React from 'react';
import { tokens } from '../../design/tokens';
import { centeredContent, emptyState, skeleton, animations } from '../../styles/layouts';
import Card from './Card';

/**
 * 통합 로딩 상태 컴포넌트
 * 32개 파일에서 중복되던 로딩 UI 패턴을 통합
 */
const LoadingState = ({
  message = '정보를 불러오는 중...',
  description = '잠시만 기다려주세요',
  icon = '✨',
  showSkeleton = false,
  skeletonType = 'default',
  className = '',
  style = {}
}) => {
  const containerStyle = {
    ...centeredContent,
    ...style
  };

  const renderSkeleton = () => {
    switch (skeletonType) {
      case 'character':
        return (
          <Card style={{ padding: tokens.spacing[6], width: '100%', maxWidth: '400px' }}>
            <div style={{
              ...skeleton.image,
              width: 'clamp(80px, 15vw, 110px)',
              height: 'clamp(80px, 15vw, 110px)',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: tokens.spacing[4]
            }}></div>
            
            <div style={{
              ...skeleton.text,
              width: '60%',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}></div>
            
            <div style={{
              ...skeleton.text,
              width: '40%',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}></div>
            
            <div style={{
              ...skeleton.progress,
              marginBottom: tokens.spacing[4]
            }}></div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: tokens.spacing[4]
            }}>
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  style={{
                    ...skeleton.base,
                    height: '60px',
                    borderRadius: tokens.borderRadius.lg
                  }}
                ></div>
              ))}
            </div>
          </Card>
        );
      
      case 'list':
        return (
          <div style={{ width: '100%', maxWidth: '600px' }}>
            {[...Array(3)].map((_, index) => (
              <Card key={index} style={{ 
                marginBottom: tokens.spacing[4], 
                padding: tokens.spacing[4] 
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3]
                }}>
                  <div style={{
                    ...skeleton.image,
                    width: '48px',
                    height: '48px'
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      ...skeleton.text,
                      width: '70%',
                      marginBottom: tokens.spacing[2]
                    }}></div>
                    <div style={{
                      ...skeleton.text,
                      width: '40%',
                      height: '12px'
                    }}></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );
      
      case 'grid':
        return (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: tokens.spacing[4],
            width: '100%',
            maxWidth: '800px'
          }}>
            {[...Array(6)].map((_, index) => (
              <Card key={index} style={{ padding: tokens.spacing[4] }}>
                <div style={{
                  ...skeleton.image,
                  width: '100%',
                  height: '120px',
                  marginBottom: tokens.spacing[3]
                }}></div>
                <div style={{
                  ...skeleton.text,
                  width: '80%'
                }}></div>
                <div style={{
                  ...skeleton.text,
                  width: '60%'
                }}></div>
              </Card>
            ))}
          </div>
        );
      
      default:
        return (
          <Card style={{ 
            padding: tokens.spacing[6], 
            width: '100%', 
            maxWidth: '400px' 
          }}>
            <div style={{
              ...skeleton.text,
              width: '80%',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: tokens.spacing[3]
            }}></div>
            <div style={{
              ...skeleton.text,
              width: '60%',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: tokens.spacing[3]
            }}></div>
            <div style={{
              ...skeleton.progress,
              width: '100%'
            }}></div>
          </Card>
        );
    }
  };

  return (
    <div 
      className={`loading-state ${className}`}
      style={containerStyle}
      role="main" 
      aria-label="로딩 중"
    >
      {!showSkeleton && (
        <>
          <div style={emptyState.icon}>{icon}</div>
          <h2 style={emptyState.title}>{message}</h2>
          <p style={emptyState.description}>{description}</p>
        </>
      )}
      
      {showSkeleton && renderSkeleton()}
      
      {/* CSS 애니메이션 주입 */}
      <style>
        {animations.pulse}
      </style>
    </div>
  );
};

export default LoadingState;