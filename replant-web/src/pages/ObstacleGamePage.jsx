import React, { useState, useCallback, useEffect, useRef } from 'react';
import { tokens } from '../design/tokens';
import { GameCanvas } from '../components/game';

import { useCharacter } from '../hooks';
import { gameService } from '../services';
import { ToastContainer } from '../components/ui';
import { useToast } from '../hooks';
import { getCharacterImageUrl } from '../utils/characterImageUtils';
import { logger } from '../utils/logger';

const ObstacleGamePage = () => {
  // 페이지 스타일
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.background.primary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // 안전영역 여백 반영 (iOS 노치/툴바)
    padding: tokens.spacing[4],
    paddingLeft: 'max(env(safe-area-inset-left, 0px), 1rem)',
    paddingRight: 'max(env(safe-area-inset-right, 0px), 1rem)'
  };

  // 게임 컨테이너 스타일
  const gameContainerStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  };



  const [hud, setHud] = useState({ score: 0, distance: 0, lives: 1, gameOver: false });
  const [highScore, setHighScore] = useState(0);
  const [isHighScoreLoaded, setIsHighScoreLoaded] = useState(false);
  const handleStatus = useCallback((status) => setHud(status), []);
  const [restartKey, setRestartKey] = useState(0);
  const { selectedCharacter } = useCharacter();
  const playerColor = selectedCharacter?.categoryInfo?.color || undefined;
  
  // 캐릭터 이미지 URL 생성
  const playerImageSrc = selectedCharacter?.level 
    ? getCharacterImageUrl(selectedCharacter.level, 'default')
    : null;
    
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // 게임 시작 시 최고 점수 로드
  useEffect(() => {
    const loadHighScore = async () => {
      let retryCount = 0;
      const maxRetries = 5;
      
      const tryLoadHighScore = async () => {
        try {
          const highScore = await gameService.getHighScore('obstacle');
          setHighScore(highScore);
          setIsHighScoreLoaded(true);
          return true;
        } catch (error) {
          logger.error('최고 점수 로드 실패:', error);
          return false;
        }
      };
      
      // 최대 5번까지 재시도
      while (retryCount < maxRetries) {
        const success = await tryLoadHighScore();
        if (success) break;
        
        retryCount++;
        if (retryCount < maxRetries) {
          // 200ms씩 대기하며 재시도
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      // 모든 재시도 후에도 실패하면 로딩 완료로 표시
      if (retryCount >= maxRetries) {
        setIsHighScoreLoaded(true);
      }
    };
    
    loadHighScore();
  }, []);

  const handleRestart = () => {
    // Canvas 재마운트로 상태 초기화
    setRestartKey((k) => k + 1);
    setHud({ score: 0, distance: 0, lives: 1, gameOver: false });
  };



  // 게임 종료 시 최고 점수 확인 (점수 기반)
  useEffect(() => {
    const handleGameOver = async () => {
      if (!hud.gameOver) return;
      
      // 최고 점수 확인 및 저장
      try {
        const durationMs = Math.max(0, Math.floor(hud.distance * (1000 / 220))); // 대략치
        const result = await gameService.saveAndCheckRecord('obstacle', {
          score: hud.score,
          distance: hud.distance,
          durationMs,
          characterId: selectedCharacter?.id || null,
        });
        
        if (result.success && result.isNewHigh) {
          setHighScore(hud.score);
          showSuccess(`🎉 새로운 최고 기록 달성! ${hud.score}점`);
        }
      } catch (error) {
        console.error('최고 점수 저장 실패:', error);
      }
    };
    
    handleGameOver();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hud.gameOver]);



  // 반응형 게임 크기 계산
  const [gameSize, setGameSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef(null);
  
  useEffect(() => {
    const updateGameSize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const visualWidth = window.visualViewport?.width || screenWidth;
      const containerWidth = containerRef.current?.clientWidth || screenWidth;
      
      // 컨테이너 너비를 기준으로 계산하여 좌우 패딩/사이드바 여백 반영
      const isMobile = screenWidth <= 768;
      // 좌우 여백(스크롤바/안전영역) 감안하여 여유 폭 확보
      const horizontalPadding = isMobile ? 24 : 32; // px
      const availableWidth = Math.max(280, Math.min(containerWidth, visualWidth) - horizontalPadding);
      const maxWidth = Math.min(availableWidth, 900);
      const vv = window.visualViewport;
      const safeTop = vv?.offsetTop || 0;
      const safeBottom = vv ? (screenHeight - (vv.height + safeTop)) : 0;
      const visualHeight = vv?.height || screenHeight;
      const verticalPadding = isMobile ? 48 : 80; // 상하 여유
      const maxHeight = Math.min(visualHeight - (safeTop + safeBottom) - verticalPadding, 700);

      // 화면 방향에 따라 비율 동적 적용: 세로(9:16), 가로(16:9)
      const isPortrait = visualHeight >= visualWidth;
      const aspectRatio = isPortrait ? (9 / 16) : (16 / 9); // width / height
      let width = maxWidth;
      let height = width / aspectRatio;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      // 너무 낮은 화면에서도 최소 높이 보장
      const MIN_HEIGHT = 360; // 모바일 최소 높이
      if (height < MIN_HEIGHT) {
        height = MIN_HEIGHT;
        width = height * aspectRatio;
      }
      
      setGameSize({ width: Math.floor(width), height: Math.floor(height) });
    };
    
    updateGameSize();
    window.addEventListener('resize', updateGameSize);
    
    // 컨테이너 리사이즈도 추적(사이드바 열림/닫힘, 회전 등)
    const containerEl = containerRef.current;
    let resizeObserver;
    if (window.ResizeObserver && containerEl) {
      resizeObserver = new ResizeObserver(updateGameSize);
      resizeObserver.observe(containerEl);
    }
    
    // visualViewport 변화도 감지 (주소창/툴바 노출, 줌 등)
    const vv = window.visualViewport;
    const onVVResize = () => updateGameSize();
    if (vv) {
      vv.addEventListener('resize', onVVResize);
      vv.addEventListener('scroll', onVVResize);
    }

    return () => {
      window.removeEventListener('resize', updateGameSize);
      if (resizeObserver && containerEl) {
        resizeObserver.disconnect();
      }
      if (vv) {
        vv.removeEventListener('resize', onVVResize);
        vv.removeEventListener('scroll', onVVResize);
      }
    };
  }, []);

  return (
    <div style={pageStyle}>
      {/* 게임 영역 */}
      <div style={gameContainerStyle} ref={containerRef}>
        {isHighScoreLoaded ? (
          <GameCanvas
            key={restartKey}
            width={gameSize.width}
            height={gameSize.height}
            onStatus={handleStatus}
            playerColor={playerColor}
            playerImageSrc={playerImageSrc}
            highScore={highScore}
            onRestart={handleRestart}
            onCaptureSuccess={() => showSuccess('스크린샷을 저장했어요')}
            onCaptureError={() => showError('스크린샷 저장에 실패했어요')}
            includeScoreInCapture={false}
          />
        ) : (
          <div style={{
            width: gameSize.width,
            height: gameSize.height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tokens.colors.background.primary,
            borderRadius: tokens.borderRadius.lg
          }} />
        )}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  );
};

export default ObstacleGamePage;