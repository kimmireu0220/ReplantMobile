/**
 * 앱 전용 터치 피드백 훅
 * 터치 시작/종료 시 시각적 피드백 제공
 */

import { useCallback, useRef } from 'react';

export const useTouchFeedback = (elementRef) => {
  const originalStyle = useRef(null);

  const handleTouchStart = useCallback(() => {
    if (!elementRef?.current) return;
    
    const element = elementRef.current;
    originalStyle.current = {
      opacity: element.style.opacity,
      transform: element.style.transform,
    };
    
    // 터치 피드백 적용
    element.style.opacity = '0.7';
    element.style.transform = 'scale(0.98)';
  }, [elementRef]);

  const handleTouchEnd = useCallback(() => {
    if (!elementRef?.current) return;
    
    const element = elementRef.current;
    
    // 원래 스타일로 복원
    if (originalStyle.current) {
      element.style.opacity = originalStyle.current.opacity || '1';
      element.style.transform = originalStyle.current.transform || 'scale(1)';
    } else {
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
    }
  }, [elementRef]);

  const handleTouchCancel = useCallback(() => {
    handleTouchEnd();
  }, [handleTouchEnd]);

  return {
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
  };
};
