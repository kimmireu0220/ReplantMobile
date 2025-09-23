import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../design/tokens';
import { Button, ThemeToggle } from '../components/ui';
import { PageTitle, ScreenReaderOnly } from '../components/ui/ScreenReaderOnly';

import { getCurrentUserNickname } from '../config/supabase';

const NotFoundPage = ({ layoutMode = 'full' }) => {
  const navigate = useNavigate();
  const nickname = getCurrentUserNickname();
  
  // 에러 설정
  const errorConfig = {
    title: '페이지를 찾을 수 없습니다',
    message: '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
    buttonText: '홈으로 돌아가기',
    icon: '🔍'
  };
  
  // 레이아웃별 다른 처리
  const handleGoHome = useCallback(() => {
    if (layoutMode === 'minimal' || !nickname) {
      navigate('/start');
    } else {
      navigate('/home');
    }
  }, [layoutMode, nickname, navigate]);
  
  // 키보드 네비게이션 지원
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleGoHome();
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleGoHome]);
  
  // 페이지 스타일
  const pageContainerStyle = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.background.primary,
    padding: tokens.spacing[4],
    paddingBottom: tokens.spacing[8]
  };

  const contentWrapperStyle = {
    maxWidth: tokens.components.container.maxWidth,
    margin: '0 auto',
    width: '100%'
  };

  // 헤더 스타일 (홈페이지와 일치)
  const headerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: tokens.spacing[6]
  };



  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border.light}`,
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium
  };

  // 에러 스타일 (기존 패턴과 일치)
  const errorStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    textAlign: 'center',
    gap: tokens.spacing[4]
  };

  const errorTitleStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    margin: 0
  };

  const errorTextStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    margin: 0,
    marginBottom: tokens.spacing[6] // 버튼과의 여백 추가
  };

  return (
    <div 
      style={pageContainerStyle}
      role="main"
      aria-label={errorConfig.title}
    >
      <PageTitle title={errorConfig.title} />
      <div style={contentWrapperStyle}>
        {/* 헤더 섹션 - 홈페이지와 일치 */}
        <div style={headerStyle}>
          {nickname && (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={userInfoStyle}>
                <span>👤</span>
                <span>{nickname}</span>
              </div>
              <ThemeToggle showLabel={false} showSystem={false} />
            </div>
          )}
        </div>

        {/* 에러 컨텐츠 */}
        <div style={errorStyle}>
          <div style={{ fontSize: '64px' }}>{errorConfig.icon}</div>
          <h2 style={errorTitleStyle}>{errorConfig.title}</h2>
          <p style={errorTextStyle}>
            {errorConfig.message}
          </p>
          <Button
            variant="primary"
            onClick={handleGoHome}
            aria-describedby="notfound-help"
          >
            {errorConfig.buttonText}
          </Button>
          <ScreenReaderOnly id="notfound-help">
            홈으로 돌아가 Replant를 계속 이용하세요.
          </ScreenReaderOnly>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 