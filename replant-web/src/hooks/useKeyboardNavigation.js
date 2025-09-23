/**
 * 키보드 내비게이션 관리 훅
 * 포커스 트랩, Tab 순서 관리, 화살표 키 네비게이션 지원
 */

import { useEffect, useCallback, useRef } from 'react';

export const useKeyboardNavigation = (options = {}) => {
  const { 
    enableTabLoop = true,        // Tab 키 루프 활성화
    enableArrowNavigation = false, // 화살표 키 내비게이션 활성화
    onEscape,                    // ESC 키 핸들러
    containerRef,                // 포커스 영역 컨테이너 참조
    isActive = true,             // 키보드 내비게이션 활성화 여부
    direction = 'both'           // 'horizontal', 'vertical', 'both'
  } = options;

  const focusableElementsRef = useRef([]);
  const currentFocusIndexRef = useRef(-1);

  // 포커스 가능한 요소 셀렉터
  const focusableSelector = 
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

  // 포커스 가능한 요소들 찾기
  const getFocusableElements = useCallback(() => {
    if (!containerRef?.current) return [];
    
    const elements = Array.from(containerRef.current.querySelectorAll(focusableSelector))
      .filter(element => {
        // 숨겨진 요소나 비활성화된 요소 제외
        return !element.disabled && 
               element.offsetHeight > 0 && 
               element.offsetWidth > 0 &&
               window.getComputedStyle(element).visibility !== 'hidden';
      });
    
    focusableElementsRef.current = elements;
    return elements;
  }, [containerRef]);

  // 특정 인덱스의 요소에 포커스
  const focusElementAtIndex = useCallback((index) => {
    const elements = focusableElementsRef.current;
    if (elements.length === 0) return;

    let targetIndex = index;
    
    if (enableTabLoop) {
      // 순환 처리
      if (index < 0) targetIndex = elements.length - 1;
      else if (index >= elements.length) targetIndex = 0;
    } else {
      // 범위 제한
      targetIndex = Math.max(0, Math.min(index, elements.length - 1));
    }

    const targetElement = elements[targetIndex];
    if (targetElement) {
      targetElement.focus();
      currentFocusIndexRef.current = targetIndex;
    }
  }, [enableTabLoop]);

  // 다음 포커스 가능한 요소로 이동
  const focusNext = useCallback(() => {
    const currentIndex = currentFocusIndexRef.current;
    focusElementAtIndex(currentIndex + 1);
  }, [focusElementAtIndex]);

  // 이전 포커스 가능한 요소로 이동
  const focusPrevious = useCallback(() => {
    const currentIndex = currentFocusIndexRef.current;
    focusElementAtIndex(currentIndex - 1);
  }, [focusElementAtIndex]);

  // 첫 번째 요소에 포커스
  const focusFirst = useCallback(() => {
    focusElementAtIndex(0);
  }, [focusElementAtIndex]);

  // 마지막 요소에 포커스
  const focusLast = useCallback(() => {
    const elements = focusableElementsRef.current;
    focusElementAtIndex(elements.length - 1);
  }, [focusElementAtIndex]);

  // 현재 포커스된 요소의 인덱스 업데이트
  const updateCurrentFocusIndex = useCallback(() => {
    if (!containerRef?.current) return;
    
    const activeElement = document.activeElement;
    const elements = focusableElementsRef.current;
    const index = elements.indexOf(activeElement);
    
    if (index !== -1) {
      currentFocusIndexRef.current = index;
    }
  }, [containerRef]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((event) => {
    if (!isActive) return;

    const { key, shiftKey, ctrlKey, altKey, metaKey } = event;
    
    // 수정키가 눌린 경우 기본 동작 유지
    if (ctrlKey || altKey || metaKey) return;

    switch (key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape(event);
        }
        break;

      case 'Tab':
        if (enableTabLoop) {
          event.preventDefault();
          if (shiftKey) {
            focusPrevious();
          } else {
            focusNext();
          }
        }
        break;

      case 'Home':
        if (enableArrowNavigation) {
          event.preventDefault();
          focusFirst();
        }
        break;

      case 'End':
        if (enableArrowNavigation) {
          event.preventDefault();
          focusLast();
        }
        break;

      case 'ArrowUp':
        if (enableArrowNavigation && (direction === 'vertical' || direction === 'both')) {
          event.preventDefault();
          focusPrevious();
        }
        break;

      case 'ArrowDown':
        if (enableArrowNavigation && (direction === 'vertical' || direction === 'both')) {
          event.preventDefault();
          focusNext();
        }
        break;

      case 'ArrowLeft':
        if (enableArrowNavigation && (direction === 'horizontal' || direction === 'both')) {
          event.preventDefault();
          focusPrevious();
        }
        break;

      case 'ArrowRight':
        if (enableArrowNavigation && (direction === 'horizontal' || direction === 'both')) {
          event.preventDefault();
          focusNext();
        }
        break;

      case 'Enter':
      case ' ': // 스페이스바
        // 현재 포커스된 요소가 클릭 가능한 경우 클릭 이벤트 발생
        const focusedElement = document.activeElement;
        if (focusedElement && (focusedElement.tagName === 'BUTTON' || focusedElement.role === 'button')) {
          event.preventDefault();
          focusedElement.click();
        }
        break;
        
      default:
        // 다른 키는 기본 동작 유지
        break;
    }
  }, [
    isActive,
    onEscape,
    enableTabLoop,
    enableArrowNavigation,
    direction,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast
  ]);

  // 포커스 이벤트 핸들러 (현재 포커스 인덱스 추적)
  const handleFocus = useCallback((event) => {
    updateCurrentFocusIndex();
  }, [updateCurrentFocusIndex]);

  // 이벤트 리스너 등록
  useEffect(() => {
    if (!containerRef?.current || !isActive) return;

    const container = containerRef.current;
    
    // 포커스 가능한 요소 초기화
    getFocusableElements();
    
    // 이벤트 리스너 등록
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focus', handleFocus, true);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focus', handleFocus, true);
    };
  }, [containerRef, isActive, handleKeyDown, handleFocus, getFocusableElements]);

  // 포커스 가능한 요소가 변경될 때마다 업데이트
  useEffect(() => {
    if (!isActive) return;

    const observer = new MutationObserver(() => {
      getFocusableElements();
    });

    if (containerRef?.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['tabindex', 'disabled', 'hidden']
      });
    }

    return () => observer.disconnect();
  }, [containerRef, isActive, getFocusableElements]);

  return {
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    focusElementAtIndex,
    getFocusableElements,
    currentFocusIndex: currentFocusIndexRef.current
  };
};

// 포커스 트랩 훅 (모달, 사이드바 등에서 사용)
export const useFocusTrap = (containerRef, isActive = true) => {
  const keyboardNav = useKeyboardNavigation({
    containerRef,
    enableTabLoop: true,
    enableArrowNavigation: false,
    isActive
  });

  // 포커스 트랩 활성화 시 첫 번째 요소에 포커스
  useEffect(() => {
    if (isActive && containerRef?.current) {
      // 약간의 지연 후 포커스 (DOM 업데이트 완료 후)
      setTimeout(() => {
        keyboardNav.focusFirst();
      }, 100);
    }
  }, [isActive, containerRef, keyboardNav]);

  return keyboardNav;
};

// 그리드 내비게이션 훅 (격자 형태의 UI에서 사용)
export const useGridNavigation = (containerRef, { columns = 1, isActive = true } = {}) => {
  const focusableElementsRef = useRef([]);
  const currentPositionRef = useRef({ row: 0, col: 0 });

  const getFocusableElements = useCallback(() => {
    if (!containerRef?.current) return [];
    
    const elements = Array.from(containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="gridcell"]'
    )).filter(element => !element.disabled && element.offsetHeight > 0);
    
    focusableElementsRef.current = elements;
    return elements;
  }, [containerRef]);

  const focusCell = useCallback((row, col) => {
    const elements = focusableElementsRef.current;
    const index = row * columns + col;
    
    if (index >= 0 && index < elements.length) {
      elements[index].focus();
      currentPositionRef.current = { row, col };
    }
  }, [columns]);

  const handleKeyDown = useCallback((event) => {
    if (!isActive) return;

    const { key } = event;
    const { row, col } = currentPositionRef.current;
    const totalRows = Math.ceil(focusableElementsRef.current.length / columns);

    switch (key) {
      case 'ArrowUp':
        event.preventDefault();
        focusCell(Math.max(0, row - 1), col);
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        focusCell(Math.min(totalRows - 1, row + 1), col);
        break;
        
      case 'ArrowLeft':
        event.preventDefault();
        focusCell(row, Math.max(0, col - 1));
        break;
        
      case 'ArrowRight':
        event.preventDefault();
        focusCell(row, Math.min(columns - 1, col + 1));
        break;
        
      case 'Home':
        event.preventDefault();
        focusCell(row, 0);
        break;
        
      case 'End':
        event.preventDefault();
        focusCell(row, columns - 1);
        break;
        
      default:
        // 다른 키는 기본 동작 유지
        break;
    }
  }, [isActive, columns, focusCell]);

  useEffect(() => {
    if (!containerRef?.current || !isActive) return;

    const container = containerRef.current;
    getFocusableElements();
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, isActive, handleKeyDown, getFocusableElements]);

  return {
    focusCell,
    getFocusableElements,
    currentPosition: currentPositionRef.current
  };
};

const keyboardNavigationHooks = {
  useKeyboardNavigation,
  useFocusTrap,
  useGridNavigation
};

export default keyboardNavigationHooks;