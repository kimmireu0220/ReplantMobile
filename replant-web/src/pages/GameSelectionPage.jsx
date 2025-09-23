import React, { useState, useEffect } from 'react';
import { tokens } from '../design/tokens';
import { GameCard, ThemeToggle } from '../components/ui';
import { PageTitle } from '../components/ui/ScreenReaderOnly';
import { getCurrentUserNickname } from '../config/supabase';

const GameSelectionPage = () => {
  // 반응형 상태 관리
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    // 초기 체크
    checkScreenSize();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', checkScreenSize);

    // 클린업
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 게임 목록 데이터
  const games = [
    {
      id: 'obstacle',
      title: '장애물 달리기',
      description: '빠른 반응속도로 장애물을 피하며 달려보세요!',
      icon: '🏃‍♂️',
      path: '/game/obstacle',
      available: true,
      gameType: 'obstacle'
    },
    {
      id: 'puzzle',
      title: '퍼즐 게임',
      description: '같은 색깔 씨앗들을 연결해서 식물로 키워보세요!',
      icon: '🧩',
      path: '/game/puzzle',
      available: true,
      gameType: 'puzzle'
    },
    {
      id: 'memory',
      title: '기억력 게임',
      description: '순간 기억력과 집중력을 키워보세요!',
      icon: '🎯',
      path: '/game/memory',
        available: true,
      gameType: 'memory'
    },
    {
      id: 'quiz',
      title: '퀴즈 게임',
      description: '재미있는 문제로 상식을 넓혀보세요!',
      icon: '💡',
      path: '/game/quiz',
        available: true,
      gameType: 'quiz'
    }
  ];

  // 페이지 스타일
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.background.primary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: tokens.spacing[4],
    paddingTop: tokens.spacing[8]
  };

  // 컨테이너/헤더/유저 정보 (DexPage 패턴 차용)
  const containerStyle = {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[6]
  };

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
    border: `1px solid ${tokens.colors.border.light}`,
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium
  };


  // 메인 컨테이너 스타일 (게임 카드들을 중앙에 배치)
  const mainContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  };

  // 반응형 그리드 스타일 (JavaScript로 구현)
  const finalGridStyle = {
    width: '100%',
    maxWidth: '800px',
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: isMobile ? tokens.spacing[4] : tokens.spacing[6],
    marginTop: tokens.spacing[2]
  };

  // 카드 컨테이너 스타일 (Mission/Dex 페이지와 일관)
  const cardStyle = {
    backgroundColor: tokens.colors.background.primary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[6],
    boxShadow: tokens.shadow.base,
    border: 'none'
  };

  const pageTitleStyle = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2]
  };

  const pageSubtitleStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[4]
  };

  const nickname = getCurrentUserNickname();

  return (
    <div style={pageStyle} role="main" aria-label="미니 게임">
      <PageTitle title="미니 게임" />

      <div style={containerStyle}>
        <div style={headerStyle}>
          <div></div>
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

        {/* 게임 그리드: 카드 컨테이너 내부로 이동 */}
        <div style={cardStyle}>
          <h2 style={pageTitleStyle}>🎮 미니 게임</h2>
          <p style={pageSubtitleStyle}>원하는 미니 게임을 선택해 즐겨보세요.</p>
          <div style={mainContainerStyle}>
            <div style={finalGridStyle}>
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  title={game.title}
                  description={game.description}
                  icon={game.icon}
                  path={game.path}
                  available={game.available}
                  gameType={game.gameType}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSelectionPage;