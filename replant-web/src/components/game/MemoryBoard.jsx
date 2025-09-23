import React, { useEffect, useMemo, useRef } from 'react';
import MemoryCard from './MemoryCard';
import { getCharacterImageUrl } from '../../utils/characterImageUtils';
import { tokens } from '../../design/tokens';
import { ScreenReaderOnly } from '../ui';
import { useMemoryGame } from '../../hooks';

const MemoryBoard = ({
  characterLevel = 1,
  pairCount = 6,
  onGameEnd,
  isPaused = false,
  restartKey = 0,
  onGameStart,
}) => {
  // 이미지 URL 메모이제이션
  const faceUrl = useMemo(() => getCharacterImageUrl(characterLevel, 'default'), [characterLevel]);
  const faceUrlHappy = useMemo(() => getCharacterImageUrl(characterLevel, 'happy'), [characterLevel]);
  
  // 메모리 게임 훅 사용
  const {
    gameState,
    cards,
    liveMessage,
    mismatchedIds,
    initializeGame,
    handleCardClick,
    getCardState,
    GAME_STATES
  } = useMemoryGame(pairCount, characterLevel, onGameEnd);
  
  // 캔버스 크기 관리
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = React.useState({ 
    width: 600, 
    height: 480, 
    cardSize: 104, 
    gapSize: 20,
    cols: 4
  });

  // 게임 초기화
  useEffect(() => {
    initializeGame(faceUrl, faceUrlHappy);
  }, [pairCount, faceUrl, faceUrlHappy, restartKey, initializeGame]);

  // 게임 시작 알림 (onGameStart 호출 제거)
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING) {
      onGameStart?.();
    }
  }, [gameState, onGameStart, GAME_STATES.PLAYING]);

  // 반응형 캔버스 크기 계산
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const canvasWidth = Math.min(containerWidth * 0.95, 600);
      const canvasHeight = canvasWidth * 0.8;
      
      const baseSizes = { 4: 120, 6: 100, 8: 80, 10: 70, 12: 60, 15: 50 };
      const baseCardSize = baseSizes[pairCount] || 60;
      
      const cols = pairCount >= 10 ? 6 : 4;
      const rows = Math.ceil(pairCount * 2 / cols);
      const gapSize = pairCount >= 12 ? 12 : 16;
      
      const maxCardWidth = (canvasWidth - (cols - 1) * gapSize) / cols;
      const maxCardHeight = (canvasHeight - (rows - 1) * gapSize) / rows;
      const maxCardSize = Math.min(maxCardWidth, maxCardHeight);
      
      // 반픽셀 크기로 인해 내용이 흐릿해지는 것을 방지하기 위해 카드 크기를 정수로 고정
      const cardSize = Math.round(Math.max(50, Math.min(baseCardSize, maxCardSize)));
      
      setCanvasSize({
        width: canvasWidth,
        height: canvasHeight,
        cardSize,
        gapSize,
        cols
      });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [pairCount]);

  // 스타일 정의
  const canvasStyle = {
    position: 'relative',
    width: canvasSize.width,
    height: canvasSize.height,
    margin: '0 auto',
    backgroundColor: tokens.colors.background.subtle,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border.default}`,
    overflow: 'visible',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${canvasSize.cols}, ${canvasSize.cardSize}px)`,
    gridAutoRows: `${canvasSize.cardSize}px`,
    gap: canvasSize.gapSize,
  };

  

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <ScreenReaderOnly>
        <div aria-live="polite">{liveMessage}</div>
      </ScreenReaderOnly>
      <div style={canvasStyle}>
        <div style={gridStyle}>
          {cards.map((card) => {
            const state = getCardState(card);
            const face = card.faceUrl || faceUrl;
            
            return (
              <MemoryCard
                key={card.id}
                id={card.id}
                isFlipped={state.isFlipped}
                isMatched={state.isMatched}
                isMismatched={mismatchedIds.has(card.id)}
                onClick={handleCardClick}
                faceUrl={face}
                badge={card.badge}
                ariaLabel={state.isMatched ? '매치된 카드' : '뒤집기'}
                size={canvasSize.cardSize}
                disabled={isPaused}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MemoryBoard;


