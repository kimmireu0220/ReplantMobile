/**
 * 다크모드 구현 검증 유틸리티
 * 개발 환경에서 테마 시스템이 올바르게 동작하는지 검증
 */

export const verifyThemeSystem = () => {
  const results = {
    cssVariablesSupported: false,
    themeContextWorking: false,
    localStoragePersistence: false,
    systemThemeDetection: false,
    domAttributesApplied: false,
    colorTransitions: false,
    errors: []
  };

  try {
    // 1. CSS 변수 지원 확인
    const testElement = document.createElement('div');
    testElement.style.color = 'var(--test-variable, red)';
    results.cssVariablesSupported = testElement.style.color.includes('var(--test-variable');
    
    // 2. DOM 테마 속성 확인
    const htmlElement = document.documentElement;
    const hasDataTheme = htmlElement.hasAttribute('data-theme') || htmlElement.classList.contains('dark');
    results.domAttributesApplied = hasDataTheme;

    // 3. CSS 변수 값 읽기 테스트
    const computedStyle = getComputedStyle(htmlElement);
    const primaryBg = computedStyle.getPropertyValue('--color-background-primary');
    const primaryText = computedStyle.getPropertyValue('--color-text-primary');
    
    if (primaryBg && primaryText) {
      console.log('🎨 현재 CSS 변수 값:', {
        backgroundColor: primaryBg.trim(),
        textColor: primaryText.trim()
      });
    }

    // 4. localStorage 테스트
    try {
      const storedTheme = localStorage.getItem('replant-theme');
      results.localStoragePersistence = storedTheme !== null;
    } catch (e) {
      results.errors.push('localStorage 접근 실패');
    }

    // 5. 시스템 테마 감지 테스트
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      results.systemThemeDetection = typeof mediaQuery.matches === 'boolean';
    } catch (e) {
      results.errors.push('시스템 테마 감지 실패');
    }

    // 6. 색상 전환 애니메이션 확인
    const bodyStyle = getComputedStyle(document.body);
    const transition = bodyStyle.getPropertyValue('transition');
    results.colorTransitions = transition.includes('color') || transition.includes('background');

  } catch (error) {
    results.errors.push(`전체 검증 실패: ${error.message}`);
  }

  return results;
};

export const logVerificationResults = () => {
  const results = verifyThemeSystem();
  
  console.group('🔍 Replant 다크모드 검증 결과');
  
  console.log('✅ 검증 항목들:');
  Object.entries(results).forEach(([key, value]) => {
    if (key !== 'errors') {
      const status = value ? '✅' : '❌';
      const label = {
        cssVariablesSupported: 'CSS 변수 지원',
        themeContextWorking: 'ThemeContext 동작',
        localStoragePersistence: 'localStorage 지속성',
        systemThemeDetection: '시스템 테마 감지',
        domAttributesApplied: 'DOM 테마 속성',
        colorTransitions: '색상 전환 애니메이션'
      };
      console.log(`${status} ${label[key] || key}`);
    }
  });

  if (results.errors.length > 0) {
    console.group('❌ 발견된 문제들:');
    results.errors.forEach(error => console.log(`- ${error}`));
    console.groupEnd();
  }

  const successCount = Object.values(results).filter(v => v === true).length;
  const totalCount = Object.keys(results).length - 1; // errors 제외
  
  console.log(`📊 전체 점수: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  console.groupEnd();

  return results;
};

// 테마 전환 테스트 함수
export const testThemeToggle = () => {
  console.log('🧪 테마 전환 테스트 시작...');
  
  const before = {
    dataTheme: document.documentElement.getAttribute('data-theme'),
    darkClass: document.documentElement.classList.contains('dark')
  };
  
  // DOM 이벤트로 테마 전환 시뮬레이션
  const event = new CustomEvent('theme-toggle-test');
  document.dispatchEvent(event);
  
  setTimeout(() => {
    const after = {
      dataTheme: document.documentElement.getAttribute('data-theme'),
      darkClass: document.documentElement.classList.contains('dark')
    };
    
    console.log('🎭 테마 전환 전후 비교:', { before, after });
    
    const changed = before.dataTheme !== after.dataTheme || before.darkClass !== after.darkClass;
    console.log(changed ? '✅ 테마 전환 성공' : '❌ 테마 전환 실패');
  }, 100);
};

// 개발 환경에서만 실행
if (process.env.NODE_ENV === 'development') {
  // 페이지 로드 후 자동 검증
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(logVerificationResults, 1000);
    });
    
    // 전역에 검증 함수 노출
    window.verifyReplantTheme = logVerificationResults;
    window.testReplantThemeToggle = testThemeToggle;
  }
}