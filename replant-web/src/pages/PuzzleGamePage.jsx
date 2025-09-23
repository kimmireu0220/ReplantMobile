import React, { useState, useCallback, useEffect } from 'react';
import { tokens } from '../design/tokens';
import PuzzleGameCanvas from '../components/game/PuzzleGameCanvas';
import { useCharacter } from '../hooks';
import { gameService } from '../services';
import { ToastContainer } from '../components/ui';
import { useToast } from '../hooks';
import { logger } from '../utils/logger';

const PuzzleGamePage = () => {
  // 라우팅 미사용 상태로 제거됨
  
  // 게임 상태
  const [gameState, setGameState] = useState({ 
    score: 0, 
    level: 1, 
    timeLeft: 60,
    gameOver: false,
    combo: 0 
  });
  const [highScore, setHighScore] = useState(0);
  const [isHighScoreLoaded, setIsHighScoreLoaded] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  
  // 캐릭터 시스템
  const { selectedCharacter } = useCharacter();
    
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // 최고 점수 로드
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const score = await gameService.getHighScore('puzzle');
        setHighScore(score || 0);
        setIsHighScoreLoaded(true);
      } catch (error) {
        logger.error('Failed to load high score:', error);
        setHighScore(0);
        setIsHighScoreLoaded(true);
      }
    };

    loadHighScore();
  }, []);

  // 게임 종료 처리
  const handleGameEnd = useCallback(async (finalState) => {
    const { score } = finalState;
    // 시간 제한 게임이므로 항상 완료로 처리
    
    try {
      // 최고 점수 업데이트
      const result = await gameService.saveAndCheckRecord('puzzle', {
        score: score,
        durationMs: (60 - finalState.timeLeft) * 1000, // 플레이 시간
        characterId: selectedCharacter?.id || null,
      });

      if (result.success && result.isNewHigh) {
        setHighScore(score);
        showSuccess(`🎉 새로운 최고 기록 달성! ${score}점`);
      }

      // 게임 결과 로깅
      logger.info('Puzzle game completed', {
        score: finalState.score,
        timeLeft: finalState.timeLeft,
        combo: finalState.combo,
        character: selectedCharacter?.categoryInfo?.name
      });

    } catch (error) {
      logger.error('Error handling game end:', error);
      showError('게임 결과 저장 중 오류가 발생했습니다.');
    }
  }, [selectedCharacter, showSuccess, showError]);

  // 게임 상태 업데이트 핸들러
  const handleGameStateChange = useCallback((newState) => {
    setGameState(newState);
    
    // 게임 종료 처리
    if (newState.gameOver && !gameState.gameOver) {
      handleGameEnd(newState);
    }
  }, [gameState.gameOver, handleGameEnd]);

  // 게임 재시작
  const handleRestart = useCallback(() => {
    setRestartKey(prev => prev + 1);
  }, []);

  // 메인으로 돌아가기
  // 사용되지 않는 콜백 제거 (경고 제거)

  // 스타일 정의
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.background.primary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing[4]
  };

  const gameContainerStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: tokens.spacing[4]
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '500px',
    marginBottom: tokens.spacing[4]
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2]
  };


  const statsContainerStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: '500px',
    padding: tokens.spacing[3],
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${tokens.colors.border.primary}`
  };

  const statStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacing[1]
  };

  const statLabelStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium
  };

  const statValueStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary
  };

  // 사용되지 않는 버튼 스타일 제거

  // 사용되지 않는 보조 버튼 스타일 제거

  return (
    <div style={pageStyle}>
      <main style={gameContainerStyle} role="main">
        {/* 헤더 */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>
            🧩 퍼즐 게임
          </h1>
        </div>

        {/* 게임 통계 */}
        <div style={statsContainerStyle}>
          {/* 1. 최고 점수 */}
          <div style={statStyle}>
            <span style={statLabelStyle}>최고 점수</span>
            <span style={statValueStyle}>
              {isHighScoreLoaded ? highScore.toLocaleString() : '—'}
            </span>
          </div>
          {/* 2. 현재 점수 */}
          <div style={statStyle}>
            <span style={statLabelStyle}>점수</span>
            <span style={statValueStyle}>{gameState.score.toLocaleString()}</span>
          </div>
          {/* 3. 남은 시간 */}
          <div style={statStyle}>
            <span style={statLabelStyle}>남은 시간</span>
            <span style={{ 
              ...statValueStyle, 
              color: gameState.timeLeft <= 10 ? '#FF6B6B' : tokens.colors.text.primary 
            }}>
              {gameState.timeLeft}초
            </span>
          </div>
          {/* 4. 콤보 */}
          <div style={statStyle}>
            <span style={statLabelStyle}>콤보</span>
            <span style={{ ...statValueStyle, color: '#FF6B6B' }}>
              {gameState.combo > 0 ? `${gameState.combo}x` : '0X'}
            </span>
          </div>
        </div>

        {/* 남은 시간 바 */}
        <div style={{
          width: '100%',
          maxWidth: '500px',
          marginBottom: tokens.spacing[3]
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: tokens.spacing[2]
          }}>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.secondary }}>
              남은 시간
            </span>
            <span style={{ 
              fontSize: tokens.typography.fontSize.sm, 
              color: gameState.timeLeft <= 10 ? '#FF6B6B' : tokens.colors.text.secondary,
              fontWeight: gameState.timeLeft <= 10 ? 'bold' : 'normal'
            }}>
              {gameState.timeLeft}초
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: tokens.colors.gray[200],
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{
              width: `${(gameState.timeLeft / 60) * 100}%`,
              height: '100%',
              backgroundColor: gameState.timeLeft <= 10 
                ? '#FF6B6B' 
                : gameState.timeLeft <= 20
                ? '#F39C12'  
                : '#2ECC71',
              transition: 'all 0.8s ease-in-out',
              borderRadius: '5px'
            }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '2px',
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.text.secondary
          }}>
            <span>0초</span>
            <span>60초</span>
          </div>
        </div>

        {/* 별도 최고 점수 블록 제거: 상단 통계 섹션에 통합 */}

        {/* 게임 캔버스: 최고 점수 로딩 완료 전에는 동일 크기의 플레이스홀더로 공간 확보 */}
        {isHighScoreLoaded ? (
          <PuzzleGameCanvas
            onStatusChange={handleGameStateChange}
            restartKey={restartKey}
            isPaused={false}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: '100%',
              maxWidth: '500px',
              aspectRatio: '1 / 1',
              border: '2px solid #DEE2E6',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          />
        )}

        {/* 게임 오버 오버레이 */}
        {gameState.gameOver && (
          <div
            style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.6)',
              backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Game Over"
            onClick={handleRestart}
          >
            <div style={{
              backgroundColor: 'transparent',
              padding: tokens.spacing[8],
              borderRadius: tokens.borderRadius.lg,
              textAlign: 'center',
              maxWidth: '420px',
              width: '92%',
              boxShadow: 'none',
              border: 'none'
            }}>
              <div style={{ 
                fontSize: tokens.typography.fontSize['4xl'], 
                fontWeight: tokens.typography.fontWeight.bold,
                marginBottom: tokens.spacing[4],
                color: tokens.colors.text.inverse,
                textShadow: '0 2px 8px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.35)'
              }}>
                Game Over
              </div>

              <div style={{
                display: 'inline-block',
                fontSize: tokens.typography.fontSize.xl,
                color: tokens.colors.text.inverse,
                fontWeight: tokens.typography.fontWeight.semibold,
                padding: 0,
                backgroundColor: 'transparent',
                borderRadius: 0,
                boxShadow: 'none',
                textShadow: '0 1px 3px rgba(0,0,0,0.45)'
              }}>
                다시 시작
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 토스트 알림 */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default PuzzleGamePage;