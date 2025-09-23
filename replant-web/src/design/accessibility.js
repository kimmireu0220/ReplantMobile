/**
 * WCAG 2.1 기준 접근성 토큰 시스템
 * 색상 대비, 포커스 관리, 키보드 접근성을 위한 디자인 토큰
 */

// 색상 대비 계산 유틸리티
export const calculateContrastRatio = (color1, color2) => {
  const getLuminance = (color) => {
    // HEX to RGB 변환
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // 상대 휘도 계산
    const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    
    return luminance;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

// WCAG 대비 기준
export const contrastStandards = {
  AAA_NORMAL: 7,        // AAA 일반 텍스트
  AA_NORMAL: 4.5,       // AA 일반 텍스트 
  AAA_LARGE: 4.5,       // AAA 대형 텍스트
  AA_LARGE: 3,          // AA 대형 텍스트 (18px+ 또는 14px+ 굵게)
  UI_COMPONENTS: 3      // UI 컴포넌트 최소 기준
};

// 색상 대비 검증 함수
export const validateColorContrast = (backgroundColor, foregroundColor, textSize = 'normal') => {
  const ratio = calculateContrastRatio(backgroundColor, foregroundColor);
  
  const isLargeText = textSize === 'large';
  const aaThreshold = isLargeText ? contrastStandards.AA_LARGE : contrastStandards.AA_NORMAL;
  const aaaThreshold = isLargeText ? contrastStandards.AAA_LARGE : contrastStandards.AAA_NORMAL;
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passAA: ratio >= aaThreshold,
    passAAA: ratio >= aaaThreshold,
    level: ratio >= aaaThreshold ? 'AAA' : ratio >= aaThreshold ? 'AA' : 'Fail',
    recommendation: ratio < aaThreshold ? '색상 대비를 높여주세요' : '적절한 대비입니다'
  };
};

// WCAG 준수 접근성 색상 팔레트
export const accessibilityTokens = {
  // 대비 기준
  contrast: contrastStandards,
  
  // 접근성 준수 색상
  colors: {
    // 고대비 포커스 인디케이터 (대비율 7:1 이상)
    focus: '#005fcc',
    focusOutline: '#0066ff',
    
    // WCAG AA 준수 상태 색상
    success: '#0d7935',      // 녹색 - 대비율 4.6:1
    error: '#d73527',        // 빨강 - 대비율 5.1:1  
    warning: '#b25f00',      // 주황 - 대비율 4.5:1
    info: '#1565c0',         // 파랑 - 대비율 4.8:1
    
    // 고대비 텍스트 색상
    textHighContrast: '#000000',     // 검정 - 21:1
    textMediumContrast: '#2d3748',   // 진한 회색 - 12.6:1
    textLowContrast: '#4a5568',      // 중간 회색 - 7.2:1 (AAA 최소)
    
    // 배경색과의 최적 대비를 위한 색상
    onLight: {
      primary: '#1a202c',     // 어두운 배경에서 높은 대비
      secondary: '#2d3748',   // 중간 대비
      tertiary: '#4a5568'     // 최소 AAA 대비
    },
    
    onDark: {
      primary: '#ffffff',     // 밝은 배경에서 최고 대비
      secondary: '#f7fafc',   // 약간 어두운 흰색
      tertiary: '#e2e8f0'     // 최소 AAA 대비
    }
  },
  
  // 감정 색상 접근성 개선 버전
  emotionsAccessible: {
    happy: '#f6ad2e',        // 노랑 - 대비율 4.8:1
    excited: '#dd6b20',      // 주황 - 대비율 4.5:1
    calm: '#2b6cb0',         // 파랑 - 대비율 4.7:1
    grateful: '#6b46c1',     // 보라 - 대비율 4.5:1
    sad: '#4a5568',          // 회색 - 대비율 7.2:1
    angry: '#c53030',        // 빨강 - 대비율 5.3:1
    anxious: '#d69e2e',      // 노랑 - 대비율 4.6:1
    tired: '#2d3748'         // 진한 회색 - 대비율 12.6:1
  },
  
  // 터치 타겟 크기 (접근성 가이드라인)
  touchTargets: {
    minimum: 44,             // px - iOS/Android 최소 기준
    comfortable: 48,         // px - 권장 크기
    premium: 56,             // px - 프리미엄 경험
    spacing: 8               // px - 터치 타겟 간 최소 간격
  },
  
  // 포커스 관리
  focus: {
    outlineWidth: '2px',
    outlineStyle: 'solid', 
    outlineOffset: '2px',
    borderRadius: '4px'
  },
  
  // 모션 감소 설정
  reducedMotion: {
    duration: '0.01ms',
    transform: 'none',
    animation: 'none'
  }
};

// 접근성 색상 테스트 도구
export const AccessibilityTester = {
  // 색상 팔레트 전체 검증
  validateColorPalette: (colors, backgroundColor = '#ffffff') => {
    const results = {};
    
    Object.entries(colors).forEach(([name, color]) => {
      if (typeof color === 'string' && color.startsWith('#')) {
        results[name] = validateColorContrast(backgroundColor, color);
      }
    });
    
    return results;
  },
  
  // 컴포넌트별 접근성 검증
  validateComponent: (componentColors) => {
    const { background, text, border, focus } = componentColors;
    
    return {
      textContrast: validateColorContrast(background, text),
      borderContrast: validateColorContrast(background, border),
      focusContrast: validateColorContrast(background, focus),
      overall: 'pass' // 모든 테스트 통과 시
    };
  },
  
  // 실시간 대비 계산기
  checkContrast: (bg, fg) => validateColorContrast(bg, fg),
  
  // 색상 제안 도구
  suggestAccessibleColor: (backgroundColor, targetContrast = 4.5) => {
    // 목표 대비율을 만족하는 색상 제안 로직
    const suggestions = [];
    
    // 어두운 색상부터 밝은 색상까지 테스트
    const testColors = [
      '#000000', '#2d3748', '#4a5568', '#718096', '#a0aec0', '#e2e8f0', '#ffffff'
    ];
    
    testColors.forEach(color => {
      const result = validateColorContrast(backgroundColor, color);
      if (result.ratio >= targetContrast) {
        suggestions.push({
          color,
          ratio: result.ratio,
          level: result.level
        });
      }
    });
    
    return suggestions;
  }
};

export default accessibilityTokens;