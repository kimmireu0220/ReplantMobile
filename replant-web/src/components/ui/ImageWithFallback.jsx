import React, { useState, useRef, useEffect, memo } from 'react';
import { tokens } from '../../design/tokens';
import { LoadingAnnouncement } from './ScreenReaderOnly';

const ImageWithFallback = ({
  src,
  fallbackSrc,
  alt,
  style,
  className = '',
  onLoad,
  onError,
  // 성능 최적화 props
  lazy = true,
  progressive = false,
  lowQualitySrc,
  placeholder,
  threshold = 0.1,
  // 크기 최적화 props
  sizes,
  srcSet,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(progressive && lowQualitySrc ? lowQualitySrc : src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [isProgressiveLoaded, setIsProgressiveLoaded] = useState(!progressive);
  
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    
    // Progressive loading: 저품질 이미지가 로드된 후 고품질 이미지 로드
    if (progressive && !isProgressiveLoaded && currentSrc === lowQualitySrc) {
      setIsProgressiveLoaded(true);
      // 약간의 지연 후 고품질 이미지로 전환
      setTimeout(() => {
        setCurrentSrc(src);
        setIsLoading(true);
      }, 100);
    }
    
    onLoad?.();
  };

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      // Progressive loading 중이면 직접 고품질 이미지로 시도
      if (progressive && currentSrc === lowQualitySrc) {
        setCurrentSrc(src);
      } else {
        setCurrentSrc(fallbackSrc);
      }
      setHasError(false);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
    onError?.();
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, isInView, threshold]);

  // Preload high-quality image for progressive loading
  useEffect(() => {
    if (!progressive || !isProgressiveLoaded || currentSrc === src) return;

    const highQualityImg = new Image();
    highQualityImg.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
    highQualityImg.onerror = () => {
      // 고품질 이미지 로드 실패 시 저품질 이미지 유지
      setIsLoading(false);
    };
    highQualityImg.src = src;
  }, [progressive, isProgressiveLoaded, src, currentSrc]);

  // 접근성을 위한 alt 텍스트 검증
  const accessibleAlt = alt || (hasError ? '이미지를 불러올 수 없습니다' : '');
  
  // 렌더링할 소스 결정
  const shouldRenderImage = lazy ? isInView : true;
  const imageSrc = shouldRenderImage ? currentSrc : (placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+');

  return (
    <div ref={imgRef} style={{ position: 'relative', ...style }}>
      {/* 스크린 리더를 위한 로딩 상태 알림 */}
      <LoadingAnnouncement 
        isLoading={isLoading}
        message={`이미지를 불러오는 중입니다: ${alt || '이미지'}`}
        completedMessage={hasError ? `이미지 로드에 실패했습니다: ${alt || '이미지'}` : undefined}
      />
      
      {/* Placeholder 또는 로딩 인디케이터 */}
      {!shouldRenderImage && placeholder && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: tokens.colors.gray[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colors.text.secondary,
            fontSize: tokens.typography.fontSize.sm
          }}
        >
          {typeof placeholder === 'string' ? placeholder : '이미지 로딩 중...'}
        </div>
      )}
      
      <img
        src={imageSrc}
        alt={accessibleAlt}
        style={{
          width: '100%',
          height: 'auto',
          opacity: isLoading || !shouldRenderImage ? 0.5 : 1,
          transition: 'opacity 0.15s ease',
          filter: progressive && currentSrc === lowQualitySrc ? 'blur(2px)' : 'none'
        }}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        sizes={sizes}
        srcSet={srcSet}
        // 접근성 속성 추가
        role={hasError ? 'img' : undefined}
        aria-describedby={hasError ? `${alt}-error` : undefined}
        {...props}
      />
      
      {/* 시각적 로딩 인디케이터 */}
      {isLoading && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: tokens.colors.text.secondary,
            fontSize: tokens.typography.fontSize.sm
          }}
          aria-hidden="true" // 스크린 리더에서는 숨김 (이미 LoadingAnnouncement가 있으므로)
        >
          로딩중...
        </div>
      )}
      
      {/* 에러 상태 설명 (스크린 리더용) */}
      {hasError && (
        <div 
          id={`${alt}-error`} 
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0
          }}
        >
          이미지를 불러오는데 실패했습니다. 네트워크 연결을 확인해주세요.
        </div>
      )}
    </div>
  );
};

export default memo(ImageWithFallback); 