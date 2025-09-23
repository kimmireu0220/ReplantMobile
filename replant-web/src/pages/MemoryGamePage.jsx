import React, { useEffect, useState, useCallback } from 'react';
import { tokens } from '../design/tokens';
import { gameService } from '../services';
import { useCharacter } from '../hooks';
import MemoryBoard from '../components/game/MemoryBoard';
import { preloadCharacterImages } from '../utils/characterImageUtils';

const MemoryGamePage = () => {
  const [highScore, setHighScore] = useState(0);
  const [isHighScoreLoaded, setIsHighScoreLoaded] = useState(false);
  const { selectedCharacter } = useCharacter();
  const level = selectedCharacter?.level || 1;
  const [pairCount, setPairCount] = useState(6);
  const [restartKey, setRestartKey] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // 최고 점수 로드
  useEffect(() => {
    let mounted = true;
    const loadHighScore = async () => {
      try {
        const score = await gameService.getHighScore('memory');
        if (mounted) setHighScore(score || 0);
      } catch (_) {
        if (mounted) setHighScore(0);
      } finally {
        if (mounted) setIsHighScoreLoaded(true);
      }
    };
    loadHighScore();
    return () => { mounted = false; };
  }, []);

  // 캐릭터 이미지 프리로딩
  useEffect(() => {
    preloadCharacterImages([level]);
  }, [level]);

  // 게임 타이머
  useEffect(() => {
    let interval = null;
    if (gameStarted && !gameEnded) {
      interval = setInterval(() => {
        setCurrentTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameEnded]);

  // 게임 종료 핸들러
  const handleGameEnd = useCallback(async ({ score, moves, durationMs }) => {
    const result = await gameService.saveAndCheckRecord('memory', {
      score,
      distance: 0,
      durationMs: Math.max(0, durationMs ?? moves * 800),
      characterId: selectedCharacter?.id || null,
    });
    if (result.success && result.isNewHigh) {
      setHighScore(score);
    }
    setGameEnded(true);
  }, [selectedCharacter]);

  // 게임 시작 핸들러
  const handleGameStart = useCallback(() => {
    setGameStarted(true);
    setCurrentTime(0);
  }, []);

  // 게임 재시작 핸들러
  const handleRestart = useCallback(() => {
    setRestartKey(prev => prev + 1);
    setGameEnded(false);
    setGameStarted(false);
    setCurrentTime(0);
  }, []);

  // 난이도 변경 핸들러
  const handleDifficultyChange = useCallback((newPairCount) => {
    setPairCount(newPairCount);
    setGameEnded(false);
    setGameStarted(false);
    setCurrentTime(0);
  }, []);

  // 스타일 정의
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.background.primary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing[4]} ${tokens.spacing[3]}`,
    minWidth: 0
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '900px',
    backgroundColor: tokens.colors.background.primary,
    borderRadius: '20px',
    boxShadow: `0 8px 24px var(--color-shadow-medium)`,
    border: `1px solid ${tokens.colors.border.light}`,
    padding: tokens.spacing[6],
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden',
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2]
  };

  const highScoreStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.primary,
    backgroundColor: tokens.colors.background.tertiary,
    borderRadius: tokens.borderRadius.md,
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    display: 'inline-block'
  };

  const headerRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing[3],
    flexWrap: 'wrap',
    marginBottom: tokens.spacing[4],
    paddingBottom: tokens.spacing[3],
    borderBottom: `2px solid ${tokens.colors.primary[100]}`
  };

  const controlBarStyle = {
    display: 'flex',
    gap: tokens.spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    backgroundColor: tokens.colors.background.tertiary,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border.light}`,
    padding: tokens.spacing[3],
    marginTop: tokens.spacing[1],
    marginBottom: 0
  };

  const difficultyButton = (value, label) => {
    const isSelected = pairCount === value;
    return (
      <button
        key={value}
        type="button"
        onClick={() => handleDifficultyChange(value)}
        aria-pressed={isSelected}
        style={{
          padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
          borderRadius: tokens.borderRadius.full,
          // 다크/라이트 모드 모두에서 대비가 명확하도록 설정
          border: isSelected
            ? `1px solid var(--color-primary-500, #22c55e)`
            : `1px solid ${tokens.colors.border.light}`,
          background: isSelected
            ? 'var(--color-primary-400, #4ade80)'
            : tokens.colors.background.primary,
          color: isSelected
            ? 'var(--color-text-inverse, #0f172a)'
            : tokens.colors.text.secondary,
          cursor: 'pointer',
          fontWeight: tokens.typography.fontWeight.semibold,
          fontSize: tokens.typography.fontSize.sm,
          transition: 'all 150ms ease',
          boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
        }}
      >
        {label}
      </button>
    );
  };

  const gameContainerStyle = {
    marginTop: tokens.spacing[3],
    backgroundColor: 'rgba(34, 197, 94, 0.02)',
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid rgba(34, 197, 94, 0.1)`,
    padding: tokens.spacing[3],
    position: 'relative'
  };

  const timerStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: pairCount === 8 ? tokens.spacing[2] : tokens.spacing[1]
  };

  const timerDisplayStyle = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.primary[600],
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: tokens.borderRadius.full,
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    border: `1px solid ${tokens.colors.primary[200]}`,
    boxShadow: '0 1px 3px rgba(34, 197, 94, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[1]
  };

  const restartButtonStyle = {
    padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
    borderRadius: tokens.borderRadius.full,
    border: `2px solid ${tokens.colors.primary[500]}`,
    background: tokens.colors.primary[500],
    color: tokens.colors.text.inverse,
    cursor: 'pointer',
    fontWeight: tokens.typography.fontWeight.semibold,
    fontSize: tokens.typography.fontSize.base,
    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
    transition: 'all 150ms ease'
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={headerRowStyle}>
          <div style={titleStyle} aria-label="기억력 게임">🎯 기억력 게임</div>
          <div style={highScoreStyle} aria-live="polite">
            {isHighScoreLoaded ? `🏆 최고 점수: ${highScore.toLocaleString()}점` : '최고 점수 불러오는 중...'}
          </div>
        </div>
        
        <div style={controlBarStyle}>
          <span style={{ 
            color: tokens.colors.text.primary, 
            fontSize: tokens.typography.fontSize.sm, 
            fontWeight: tokens.typography.fontWeight.semibold,
            paddingRight: tokens.spacing[2]
          }}>
            난이도:
          </span>
          {difficultyButton(4, '4페어')}
          {difficultyButton(6, '6페어')}
          {difficultyButton(8, '8페어')}
          {difficultyButton(12, '12페어')}
        </div>
        
        <div style={gameContainerStyle}>
          <div style={timerStyle}>
            <div style={timerDisplayStyle}>
              ⏱️ {formatTime(currentTime)}
            </div>
          </div>
          
          <MemoryBoard 
            characterLevel={level} 
            pairCount={pairCount} 
            onGameEnd={handleGameEnd} 
            restartKey={restartKey}
            onGameStart={handleGameStart}
          />
        </div>
        
        {gameEnded && (
          <div style={{ 
            marginTop: tokens.spacing[4], 
            display: 'flex', 
            justifyContent: 'center',
            paddingTop: tokens.spacing[3],
            borderTop: `1px solid ${tokens.colors.border.light}`
          }}>
            <button
              type="button"
              onClick={handleRestart}
              style={restartButtonStyle}
            >
              게임 초기화
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryGamePage;