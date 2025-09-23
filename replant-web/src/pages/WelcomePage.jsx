import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../design/tokens';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { PageTitle, ScreenReaderOnly } from '../components/ui/ScreenReaderOnly';



const WelcomePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef(null);

  // 온보딩 단계별 내용
  const onboardingSteps = [
    {
      title: "나만의 캐릭터 키우기 시작",
      description: "성장하는 특별한 여정!",
      icon: "🌱",
      color: tokens.colors.accent.green,
      ariaLabel: "Replant 앱 소개"
    },
    {
      title: "기분 한 줄, 성장 한 걸음",
      description: "기록으로 키우는 캐릭터!",
      icon: "📝",
      color: tokens.colors.accent.blue,
      ariaLabel: "감정 일기 기능 소개"
    },
    {
      title: "미션 클리어 = 레벨업!",
      description: "도전으로 성장하기!",
      icon: "🎯",
      color: tokens.colors.accent.orange,
      ariaLabel: "미션 시스템 소개"
    },
    {
      title: "재미있는 미니게임으로 스트레스 해소",
      description: "즐거운 휴식 시간!",
      icon: "🎮",
      color: tokens.colors.accent.yellow,
      ariaLabel: "미니게임 기능 소개"
    },
    {
      title: "다양한 캐릭터를 수집해보세요",
      description: "성장의 증거를 모아보세요!",
      icon: "📖",
      color: tokens.colors.accent.blue,
      ariaLabel: "캐릭터 도감 기능 소개"
    },
    {
      title: "힘들 때 말할 친구가 있어요",
      description: "언제든 대화 가능!",
      icon: "💬",
      color: tokens.colors.accent.purple,
      ariaLabel: "상담 서비스 소개"
    }
  ];

  // 스와이프 제스처 설정
  useSwipeGesture(containerRef, {
    onSwipeLeft: () => {
      // 왼쪽으로 스와이프 = 다음 단계
      handleNext();
    },
    onSwipeRight: () => {
      // 오른쪽으로 스와이프 = 이전 단계
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    },
    threshold: 50,
    preventScroll: false,
    enabledGestures: ['swipe']
  });

  const handleNext = useCallback(() => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계에서는 시작 페이지로 이동
      navigate('/start', { replace: true });
    }
  }, [currentStep, onboardingSteps.length, navigate]);

  const handleSkip = useCallback(() => {
    // 온보딩을 건너뛰고 바로 시작 페이지로 이동
    navigate('/start', { replace: true });
  }, [navigate]);




  // 키보드 네비게이션 지원
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleNext]);

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const currentStepData = onboardingSteps[currentStep];

  // 페이지 스타일
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.background.primary,
    padding: tokens.spacing[4]
  };

  // 메인 컨테이너 스타일
  const containerStyle = {
    maxWidth: '480px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  };

  // 헤더 스타일
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[2]
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2]
  };

  // 온보딩 콘텐츠 스타일 (헤더 제외한 나머지 공간에서 중앙 배치)
  const contentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: 'calc(100vh - 120px)' // 헤더 높이를 제외한 전체 높이
  };

  // 온보딩 콘텐츠 스타일
  const iconStyle = {
    fontSize: 'clamp(4rem, 12vw, 6rem)', // 64px ~ 96px responsive
    marginBottom: tokens.spacing[6],
    display: 'block',
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
  };

  const descriptionStyle = {
    fontSize: tokens.typography.fontSize.lg,
    color: tokens.colors.text.secondary,
    lineHeight: tokens.typography.lineHeight.relaxed,
    maxWidth: '100%',
    margin: '0 auto',
    marginBottom: tokens.spacing[4],
    textAlign: 'center'
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[3],
    marginTop: tokens.spacing[3]
  };

  const skipButtonStyle = {
    background: 'none',
    border: 'none',
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.fontSize.sm,
    padding: tokens.spacing[2],
    cursor: 'pointer',
    textDecoration: 'underline',
    marginTop: tokens.spacing[0],
    transform: 'none !important',
    boxShadow: 'none !important',
    transition: 'none !important'
  };

  const progressContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: tokens.spacing[3],
    marginBottom: tokens.spacing[8],
    padding: 0
  };

  const progressDotStyle = (isActive, isClickable = true) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: isActive ? currentStepData.color : tokens.colors.border.light,
    transition: 'all 0.15s ease',
    cursor: isClickable ? 'pointer' : 'default',
    border: 'none',
    transform: 'scale(1)',
    boxShadow: 'none'
  });





  return (
    <div 
      ref={containerRef}
      style={pageStyle}
      role="main"
      aria-label="Replant 앱 온보딩"
    >
      <PageTitle title="환영합니다" />
      <div style={containerStyle}>
        {/* 헤더 */}
        <header style={headerStyle}>
        </header>

        {/* 온보딩 콘텐츠 */}
        <div style={contentStyle}>
          {/* 진행률 표시 */}
          <div 
            style={progressContainerStyle}
            role="tablist"
            aria-label="온보딩 단계"
          >
            {onboardingSteps.map((step, index) => (
              <button
                key={index}
                style={progressDotStyle(index === currentStep, true)}
                onClick={() => handleStepClick(index)}
                aria-label={`${index + 1}단계: ${step.ariaLabel}`}
                aria-selected={index === currentStep}
                role="tab"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleStepClick(index);
                  }
                }}
              />
            ))}
          </div>

          {/* 메인 콘텐츠 */}
          <div 
            style={iconStyle}
            role="img"
            aria-label={currentStepData.ariaLabel}
          >
            {currentStepData.icon}
          </div>

          <h1 
            style={titleStyle}
            id="onboarding-title"
          >
            {currentStepData.title}
          </h1>

          <p 
            style={descriptionStyle}
            id="onboarding-description"
          >
            {currentStepData.description}
          </p>



          {/* 버튼 영역 (스와이프 네비게이션 사용으로 화살표 버튼 제거) */}
          <div style={buttonContainerStyle}>
            
            {/* 건너뛰기 버튼 */}
            <button
              style={skipButtonStyle}
              onClick={handleSkip}
              onTouchStart={handleSkip}
              aria-label="온보딩 건너뛰기"
              aria-describedby="welcome-help"
              className="no-hover-animation"
            >
              바로 시작하기
            </button>
            <ScreenReaderOnly id="welcome-help">
              온보딩을 건너뛰고 닉네임 시작 페이지로 이동합니다.
            </ScreenReaderOnly>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage; 