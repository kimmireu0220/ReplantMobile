import React from 'react';
import { PageTitle, ScreenReaderOnly } from '../components/ui/ScreenReaderOnly';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../design/tokens';
import { getCurrentUserNickname } from '../config/supabase';
import { useCharacter } from '../hooks/useCharacter';
import { useMission } from '../hooks/useMission';
import { useNotification } from '../hooks/useNotification';
import { useToast } from '../hooks/useToast';
import MainCharacterDisplay from '../components/home/MainCharacterDisplay';
import RecommendedMissions from '../components/home/RecommendedMissions';
import { ToastContainer, NotificationContainer, ThemeToggle } from '../components/ui';

const HomePage = () => {
  const navigate = useNavigate();
  const nickname = getCurrentUserNickname();
  const { selectedCharacter, loading: characterLoading } = useCharacter();
  const { missions } = useMission();
  const { notifications, removeNotification, markAsRead } = useNotification();
  const { toasts, removeToast } = useToast();
  
  
  // 페이지 컨테이너 스타일
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.background.primary,
    padding: tokens.spacing[4] // Consistent padding on all sides
  };
  
  // 메인 컨테이너 스타일
  const containerStyle = {
    maxWidth: '480px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[6]
  };
  
  // 헤더 스타일
  const headerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: tokens.spacing[2]
  };
  

  
  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border.medium}`,
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium
  };

  // 추천 미션 선택 핸들러
  const handleMissionSelect = (mission) => {
    if (mission === 'all') {
      // "전체 보기" 버튼 클릭 시 미션 페이지로 이동
      navigate('/mission');
    } else if (mission && mission.category) {
      // 특정 미션의 "시작하기" 버튼 클릭 시 해당 카테고리 미션 페이지로 이동
      navigate(`/mission?category=${mission.category}`);
    }
  };
  
  return (
    <div style={pageStyle} role="main" aria-label="홈">
      <PageTitle title="홈" />
      <div style={containerStyle}>
        {/* 헤더 섹션 */}
        <div style={headerStyle} aria-labelledby="home-header-title">
          <ScreenReaderOnly as="h1" id="home-header-title">홈</ScreenReaderOnly>
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
        
        {/* 메인 캐릭터 디스플레이 */}
        <MainCharacterDisplay 
          character={selectedCharacter}
          loading={characterLoading}
        />
        
        {/* 추천 미션 섹션 */}
        <div aria-labelledby="home-recommended-title">
          <ScreenReaderOnly as="h2" id="home-recommended-title">추천 미션</ScreenReaderOnly>
          <RecommendedMissions
          character={selectedCharacter}
          missions={missions || []}
          onSelect={handleMissionSelect}
          loading={characterLoading}
          />
        </div>

      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
        markAsRead={markAsRead}
      />
    </div>
  );
};

export default HomePage; 