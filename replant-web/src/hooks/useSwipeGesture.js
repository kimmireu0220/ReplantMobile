/**
 * 터치 제스처 인식 훅
 * 스와이프, 탭, 롱프레스 등 모바일 제스처를 처리
 */

import { useEffect, useCallback, useRef } from 'react';

export const useSwipeGesture = (elementRef, options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    threshold = 50,           // 최소 스와이프 거리 (px)
    longPressDelay = 500,     // 롱프레스 감지 시간 (ms)
    preventScroll = false,    // 스크롤과 충돌 방지
    enabledGestures = ['swipe', 'tap', 'longPress'] // 활성화할 제스처
  } = options;

  const touchDataRef = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    isMoving: false,
    longPressTimer: null,
    isSwiping: false
  });

  // 터치 시작 처리
  const handleTouchStart = useCallback((event) => {
    if (!enabledGestures.length) return;

    const touch = event.touches[0];
    const touchData = touchDataRef.current;
    
    touchData.startX = touch.clientX;
    touchData.startY = touch.clientY;
    touchData.startTime = Date.now();
    touchData.isMoving = false;
    touchData.isSwiping = false;

    // 롱프레스 타이머 시작
    if (enabledGestures.includes('longPress') && onLongPress) {
      touchData.longPressTimer = setTimeout(() => {
        if (!touchData.isMoving) {
          onLongPress(event, { x: touchData.startX, y: touchData.startY });

        }
      }, longPressDelay);
    }

    // 스크롤 방지가 필요한 경우
    if (preventScroll) {
      event.preventDefault();
    }
  }, [enabledGestures, onLongPress, longPressDelay, preventScroll]);

  // 터치 이동 처리
  const handleTouchMove = useCallback((event) => {
    const touchData = touchDataRef.current;
    if (!enabledGestures.includes('swipe')) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchData.startX;
    const deltaY = touch.clientY - touchData.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 움직임 감지 시 롱프레스 타이머 해제
    if (distance > 10) {
      touchData.isMoving = true;
      if (touchData.longPressTimer) {
        clearTimeout(touchData.longPressTimer);
        touchData.longPressTimer = null;
      }
    }

    // 스와이프 감지
    if (distance > threshold && !touchData.isSwiping) {
      touchData.isSwiping = true;
      
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // 수평 스와이프가 수직보다 큰 경우
      if (absX > absY) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight(event, { deltaX, deltaY, distance });
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft(event, { deltaX, deltaY, distance });
        }
      } 
      // 수직 스와이프가 수평보다 큰 경우
      else {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown(event, { deltaX, deltaY, distance });
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp(event, { deltaX, deltaY, distance });
        }
      }

      // 스와이프 시 스크롤 방지 (필요한 경우)
      if (preventScroll && (absX > absY)) {
        event.preventDefault();
      }
    }
  }, [enabledGestures, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, preventScroll]);

  // 터치 종료 처리
  const handleTouchEnd = useCallback((event) => {
    const touchData = touchDataRef.current;
    
    // 롱프레스 타이머 해제
    if (touchData.longPressTimer) {
      clearTimeout(touchData.longPressTimer);
      touchData.longPressTimer = null;
    }

    // 탭 처리 (움직임이 거의 없고 빠르게 끝난 경우)
    if (enabledGestures.includes('tap') && !touchData.isMoving && !touchData.isSwiping && onTap) {
      const duration = Date.now() - touchData.startTime;
      if (duration < 200) { // 200ms 이내의 빠른 터치
        onTap(event, { x: touchData.startX, y: touchData.startY, duration });

      }
    }

    // 상태 초기화
    touchData.isMoving = false;
    touchData.isSwiping = false;
  }, [enabledGestures, onTap]);

  // 터치 취소 처리 (전화 등으로 인한 중단)
  const handleTouchCancel = useCallback(() => {
    const touchData = touchDataRef.current;
    
    if (touchData.longPressTimer) {
      clearTimeout(touchData.longPressTimer);
      touchData.longPressTimer = null;
    }
    
    touchData.isMoving = false;
    touchData.isSwiping = false;
  }, []);

  // 이벤트 리스너 등록
  useEffect(() => {
    const element = elementRef?.current;
    if (!element) return;

    // 패시브 터치 이벤트로 성능 최적화
    const touchStartOptions = { passive: !preventScroll };
    const touchMoveOptions = { passive: !preventScroll };

    element.addEventListener('touchstart', handleTouchStart, touchStartOptions);
    element.addEventListener('touchmove', handleTouchMove, touchMoveOptions);
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel, preventScroll]);

  return {
    // 현재 터치 상태 정보
    isMoving: touchDataRef.current.isMoving,
    isSwiping: touchDataRef.current.isSwiping
  };
};

// 드래그 앤 드롭 제스처 훅
export const useDragGesture = (elementRef, options = {}) => {
  const {
    onDragStart,
    onDrag,
    onDragEnd,
    threshold = 10,
    axis = 'both', // 'x', 'y', 'both'
    bounds = null, // { left, right, top, bottom }
  } = options;

  const dragDataRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    offsetX: 0,
    offsetY: 0
  });

  const handlePointerDown = useCallback((event) => {
    const dragData = dragDataRef.current;
    dragData.startX = event.clientX;
    dragData.startY = event.clientY;
    dragData.currentX = event.clientX;
    dragData.currentY = event.clientY;
    
    // 포인터 캡처 (마우스가 요소 밖으로 나가도 이벤트 유지)
    event.target.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event) => {
    const dragData = dragDataRef.current;
    const deltaX = event.clientX - dragData.startX;
    const deltaY = event.clientY - dragData.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 드래그 시작 감지
    if (!dragData.isDragging && distance > threshold) {
      dragData.isDragging = true;
      if (onDragStart) {
        onDragStart(event, { startX: dragData.startX, startY: dragData.startY });
      }
    }

    // 드래그 중
    if (dragData.isDragging) {
      dragData.currentX = event.clientX;
      dragData.currentY = event.clientY;

      let newOffsetX = deltaX;
      let newOffsetY = deltaY;

      // 축 제한
      if (axis === 'x') newOffsetY = 0;
      if (axis === 'y') newOffsetX = 0;

      // 경계 제한
      if (bounds) {
        if (bounds.left !== undefined) newOffsetX = Math.max(newOffsetX, bounds.left);
        if (bounds.right !== undefined) newOffsetX = Math.min(newOffsetX, bounds.right);
        if (bounds.top !== undefined) newOffsetY = Math.max(newOffsetY, bounds.top);
        if (bounds.bottom !== undefined) newOffsetY = Math.min(newOffsetY, bounds.bottom);
      }

      dragData.offsetX = newOffsetX;
      dragData.offsetY = newOffsetY;

      if (onDrag) {
        onDrag(event, {
          offsetX: newOffsetX,
          offsetY: newOffsetY,
          deltaX,
          deltaY
        });
      }
    }
  }, [threshold, axis, bounds, onDragStart, onDrag]);

  const handlePointerUp = useCallback((event) => {
    const dragData = dragDataRef.current;
    
    if (dragData.isDragging && onDragEnd) {
      onDragEnd(event, {
        offsetX: dragData.offsetX,
        offsetY: dragData.offsetY,
        finalX: dragData.currentX,
        finalY: dragData.currentY
      });
    }

    // 상태 초기화
    dragData.isDragging = false;
    dragData.offsetX = 0;
    dragData.offsetY = 0;
    
    event.target.releasePointerCapture(event.pointerId);
  }, [onDragEnd]);

  useEffect(() => {
    const element = elementRef?.current;
    if (!element) return;

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerUp);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [elementRef, handlePointerDown, handlePointerMove, handlePointerUp]);

  return {
    isDragging: dragDataRef.current.isDragging,
    offsetX: dragDataRef.current.offsetX,
    offsetY: dragDataRef.current.offsetY
  };
};

// 핀치 줌 제스처 훅
export const usePinchGesture = (elementRef, options = {}) => {
  const {
    onPinchStart,
    onPinch,
    onPinchEnd,
    minScale = 0.5,
    maxScale = 3,
  } = options;

  const pinchDataRef = useRef({
    isPinching: false,
    initialDistance: 0,
    scale: 1
  });

  const getTouchDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((event) => {
    if (event.touches.length === 2) {
      const pinchData = pinchDataRef.current;
      pinchData.isPinching = true;
      pinchData.initialDistance = getTouchDistance(event.touches[0], event.touches[1]);
      
      if (onPinchStart) {
        onPinchStart(event, { initialDistance: pinchData.initialDistance });
      }
    }
  }, [onPinchStart]);

  const handleTouchMove = useCallback((event) => {
    if (event.touches.length === 2) {
      const pinchData = pinchDataRef.current;
      
      if (pinchData.isPinching) {
        const currentDistance = getTouchDistance(event.touches[0], event.touches[1]);
        let scale = currentDistance / pinchData.initialDistance;
        
        // 스케일 범위 제한
        scale = Math.max(minScale, Math.min(maxScale, scale));
        pinchData.scale = scale;

        if (onPinch) {
          onPinch(event, { scale, distance: currentDistance });
        }

        event.preventDefault(); // 기본 핀치 줌 방지
      }
    }
  }, [onPinch, minScale, maxScale]);

  const handleTouchEnd = useCallback((event) => {
    const pinchData = pinchDataRef.current;
    
    if (pinchData.isPinching && event.touches.length < 2) {
      pinchData.isPinching = false;
      
      if (onPinchEnd) {
        onPinchEnd(event, { finalScale: pinchData.scale });
      }
    }
  }, [onPinchEnd]);

  useEffect(() => {
    const element = elementRef?.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPinching: pinchDataRef.current.isPinching,
    scale: pinchDataRef.current.scale
  };
};

const gestureHooks = {
  useSwipeGesture,
  useDragGesture,
  usePinchGesture
};

export default gestureHooks;