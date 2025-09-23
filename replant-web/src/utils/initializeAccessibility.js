/**
 * 접근성 시스템 초기화
 * 앱 시작 시 실행되어 접근성 기능들을 설정
 */

// colorContrastValidator 제거됨

// focus-visible polyfill 적용 (구형 브라우저 지원)
const initializeFocusVisible = () => {
  // js-focus-visible 클래스 추가 (키보드/마우스 포커스 구분)
  document.documentElement.classList.add('js-focus-visible');
  
  // 간단한 focus-visible polyfill 구현
  let hadKeyboardEvent = true;

  const keyboardInputTypes = [
    'input',
    'select',
    'textarea'
  ];

  function onKeyDown(e) {
    if (e.metaKey || e.altKey || e.ctrlKey) {
      return;
    }
    hadKeyboardEvent = true;
  }

  function onPointerDown() {
    hadKeyboardEvent = false;
  }

  function onFocus(e) {
    if (hadKeyboardEvent || focusTriggersKeyboardModality(e.target)) {
      e.target.classList.add('focus-visible');
    }
  }

  function onBlur(e) {
    e.target.classList.remove('focus-visible');
  }

  function focusTriggersKeyboardModality(node) {
    return keyboardInputTypes.indexOf(node.tagName.toLowerCase()) !== -1;
  }

  // 이벤트 리스너 등록
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('mousedown', onPointerDown, true);
  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('touchstart', onPointerDown, true);
  document.addEventListener('focus', onFocus, true);
  document.addEventListener('blur', onBlur, true);

  // 초기 포커스 상태 확인
  if (document.activeElement && document.activeElement !== document.body) {
    onFocus({ target: document.activeElement });
  }
};

// 메인 콘텐츠 영역 식별
const setupMainContentArea = () => {
  const mainContent = document.querySelector('main') || 
                     document.querySelector('#root > div:first-child');
  
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
    mainContent.setAttribute('role', 'main');
  }
  
  // 스킵 링크를 위한 tabindex 설정
  if (mainContent && mainContent.tabIndex === -1) {
    mainContent.tabIndex = -1;
  }
};

// 동적 제목 관리 (페이지 변경 시 스크린 리더 알림)
const initializePageTitleManagement = () => {
  let previousTitle = document.title;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && 
          mutation.target === document.querySelector('title')) {
        const newTitle = document.title;
        
        if (newTitle !== previousTitle) {
          // 페이지 제목 변경을 스크린 리더에 알림
          announcePageChange(newTitle);
          previousTitle = newTitle;
        }
      }
    });
  });
  
  // title 요소 관찰
  const titleElement = document.querySelector('title');
  if (titleElement) {
    observer.observe(titleElement, { childList: true });
  }
  
  return () => observer.disconnect();
};

// 페이지 변경 알림
const announcePageChange = (title) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  
  const cleanTitle = title.replace(' - Replant', '');
  announcement.textContent = `${cleanTitle} 페이지로 이동했습니다`;
  
  document.body.appendChild(announcement);
  
  // 2초 후 제거
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 2000);
};

// 키보드 트랩 이스케이프 처리
const initializeGlobalKeyboardHandlers = () => {
  
  const handleGlobalKeyDown = (event) => {
    // ESC 키로 모달/오버레이 닫기
    if (event.key === 'Escape') {
      const openModal = document.querySelector('[role="dialog"][aria-hidden="false"]') ||
                       document.querySelector('.modal.open') ||
                       document.querySelector('.overlay.open');
      
      if (openModal) {
        const closeButton = openModal.querySelector('[aria-label*="닫기"]') ||
                           openModal.querySelector('.close-button') ||
                           openModal.querySelector('[data-close]');
        
        if (closeButton) {
          closeButton.click();
        }
      }
    }
    
    // Alt + / 키로 접근성 도움말 표시 (개발 모드)
    if (event.altKey && event.key === '/' && process.env.NODE_ENV === 'development') {
      event.preventDefault();
      showAccessibilityHelp();
    }
  };
  
  document.addEventListener('keydown', handleGlobalKeyDown);
  
  return () => {
    document.removeEventListener('keydown', handleGlobalKeyDown);
  };
};

// 접근성 도움말 표시 (개발 모드)
const showAccessibilityHelp = () => {
  if (document.getElementById('a11y-help')) return; // 이미 표시 중
  
  const helpDialog = document.createElement('div');
  helpDialog.id = 'a11y-help';
  helpDialog.setAttribute('role', 'dialog');
  helpDialog.setAttribute('aria-labelledby', 'a11y-help-title');
  helpDialog.setAttribute('aria-modal', 'true');
  
  helpDialog.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 2px solid #005fcc;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      max-width: 90vw;
      max-height: 90vh;
      overflow-y: auto;
      z-index: 10001;
    ">
      <h2 id="a11y-help-title" style="margin: 0 0 16px 0; color: #005fcc;">
        접근성 키보드 단축키
      </h2>
      <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
        <li><strong>Tab:</strong> 다음 요소로 포커스 이동</li>
        <li><strong>Shift + Tab:</strong> 이전 요소로 포커스 이동</li>
        <li><strong>Enter/Space:</strong> 버튼 활성화</li>
        <li><strong>Escape:</strong> 모달/메뉴 닫기</li>
        <li><strong>Arrow Keys:</strong> 메뉴/그리드 내비게이션</li>
        <li><strong>Home/End:</strong> 첫 번째/마지막 요소로 이동</li>
        <li><strong>Alt + /:</strong> 이 도움말 표시</li>
      </ul>
      <button 
        style="
          margin-top: 16px;
          padding: 8px 16px;
          background: #005fcc;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        "
        onclick="document.body.removeChild(this.closest('#a11y-help'))"
      >
        닫기
      </button>
    </div>
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
    " onclick="document.body.removeChild(document.getElementById('a11y-help'))"></div>
  `;
  
  document.body.appendChild(helpDialog);
  helpDialog.querySelector('button').focus();
};

// 라이브 리전 초기화 (전역 알림용)
const initializeLiveRegions = () => {
  // 전역 알림용 라이브 리전 생성
  if (!document.getElementById('live-region-polite')) {
    const politeRegion = document.createElement('div');
    politeRegion.id = 'live-region-polite';
    politeRegion.setAttribute('aria-live', 'polite');
    politeRegion.className = 'sr-only';
    document.body.appendChild(politeRegion);
  }
  
  if (!document.getElementById('live-region-assertive')) {
    const assertiveRegion = document.createElement('div');
    assertiveRegion.id = 'live-region-assertive';
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.className = 'sr-only';
    document.body.appendChild(assertiveRegion);
  }
};

// 전역 알림 함수
window.announceToScreenReader = (message, priority = 'polite') => {
  const regionId = priority === 'assertive' ? 'live-region-assertive' : 'live-region-polite';
  const region = document.getElementById(regionId);
  
  if (region) {
    region.textContent = message;
    
    // 같은 메시지 반복 방지를 위해 잠시 후 클리어
    setTimeout(() => {
      if (region.textContent === message) {
        region.textContent = '';
      }
    }, 1000);
  }
};

// 폰트 크기 변경 감지
const detectFontSizeChanges = () => {
  const testElement = document.createElement('div');
  testElement.style.cssText = `
    position: absolute;
    visibility: hidden;
    font-size: 16px;
    width: auto;
    height: auto;
    left: -9999px;
  `;
  testElement.textContent = 'A';
  document.body.appendChild(testElement);
  
  const baseFontSize = testElement.offsetHeight;
  
  const checkFontSize = () => {
    const currentFontSize = testElement.offsetHeight;
    const scaleFactor = currentFontSize / baseFontSize;
    
    // 폰트 크기 변경 시 CSS 변수 업데이트
    if (scaleFactor !== 1) {
      document.documentElement.style.setProperty('--font-scale-factor', scaleFactor);
    }
  };
  
  // 주기적으로 폰트 크기 확인
  setInterval(checkFontSize, 1000);
  
  document.body.removeChild(testElement);
};

// 메인 초기화 함수
export const initializeAccessibility = () => {
  try {
    // 기본 설정
    initializeFocusVisible();
    setupMainContentArea();
    initializeLiveRegions();
    
    // 이벤트 핸들러 설정
    const cleanupKeyboard = initializeGlobalKeyboardHandlers();
    const cleanupTitle = initializePageTitleManagement();
    
    // 폰트 크기 감지
    detectFontSizeChanges();
    
    // 접근성 검증 실행 (colorContrastValidator 제거됨)
    // runAccessibilityAudit();
    
    // 개발 모드에서 접근성 개발 모드 표시 (콘솔 로그 없이)
    if (process.env.NODE_ENV === 'development') {
      document.documentElement.setAttribute('data-dev-mode', 'true');
    }
    
    // 정리 함수 반환
    return () => {
      cleanupKeyboard();
      cleanupTitle();
    };
  } catch (error) {
    // 오류 시에도 빈 cleanup 함수 반환
    return () => {};
  }
};

// 접근성 상태 체크 함수
export const checkAccessibilityStatus = () => {
  const checks = {
    focusVisible: document.documentElement.classList.contains('js-focus-visible'),
    mainContent: !!document.getElementById('main-content'),
    liveRegions: !!(document.getElementById('live-region-polite') && 
                   document.getElementById('live-region-assertive')),
    colorContrast: typeof window.checkContrast === 'function'
  };
  
  const allPassed = Object.values(checks).every(check => check);
  
  return {
    allPassed,
    checks,
    message: allPassed ? '✅ 모든 접근성 기능이 정상 작동 중입니다' : 
                        '⚠️ 일부 접근성 기능에 문제가 있습니다'
  };
};

const accessibilityUtils = {
  initializeAccessibility,
  checkAccessibilityStatus,
  announceToScreenReader: (msg, priority) => window.announceToScreenReader?.(msg, priority)
};

export default accessibilityUtils;