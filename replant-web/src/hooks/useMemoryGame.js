import { useState, useEffect, useCallback } from 'react';

// 게임 상태 enum
const GAME_STATES = {
  INITIALIZING: 'initializing',
  PREVIEWING: 'previewing',
  SHOWING_START: 'showing_start',
  PLAYING: 'playing',
  FINISHED: 'finished'
};

// 애니메이션 딜레이 상수 (단순화)
const ANIMATION_DELAYS = {
  PREVIEW_START: 300,
  CARD_FLIP_INTERVAL: 150,
  PREVIEW_DURATION: 3000,
  CARD_FLIP_BACK_INTERVAL: 100,
  GAME_START_DELAY: 800
};

export const useMemoryGame = (pairCount, characterLevel, onGameEnd) => {
  // 게임 상태
  const [gameState, setGameState] = useState(GAME_STATES.INITIALIZING);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [liveMessage, setLiveMessage] = useState('');
  
  // 애니메이션 상태
  const [mismatchedIds, setMismatchedIds] = useState(new Set());
  
  // 초기화 키 관리
  const [initKey, setInitKey] = useState(0);

  // 카드 덱 생성
  const createDeck = useCallback((pairCount, faceUrl) => {
    const badges = ['🍀','🌿','🌸','🌻','🍎','🍊','🌙','⭐️','🍇','🍓','🫐','🥝','🥕','🍄','🌽'];
    const selectedBadges = badges.slice(0, pairCount);
    const cards = [];
    
    selectedBadges.forEach((badge, idx) => {
      const pairId = `p${idx}`;
      const base = { pairId, faceUrl, badge };
      cards.push({ id: `${pairId}-a`, ...base });
      cards.push({ id: `${pairId}-b`, ...base });
    });
    
    // Fisher-Yates 셔플
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    return cards;
  }, []);

  // 게임 초기화
  const initializeGame = useCallback(async (faceUrl, faceUrlHappy) => {
    try {
      // 1. 상태 초기화
      const newDeck = createDeck(pairCount, faceUrl);
      setCards(newDeck);
      setFlipped([]);
      setMatchedPairs(new Set());
      setMoves(0);
      setStartedAt(null);
      setGameState(GAME_STATES.INITIALIZING);
      setLiveMessage('게임을 준비하고 있습니다...');

      // 2. 이미지 프리로딩
      const preloadImage = (url) => new Promise((resolve) => {
        if (!url) return resolve();
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
      });
      
      await Promise.all([preloadImage(faceUrl), preloadImage(faceUrlHappy)]);

      // 3. 프리뷰 시작
      setGameState(GAME_STATES.PREVIEWING);
      setLiveMessage('카드들을 기억하세요!');
      
      await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAYS.PREVIEW_START));

      // 4. 모든 카드를 한 번에 뒤집기 (프리뷰 구간에서는 회전 대신 즉시 앞면 보여주기)
      setFlipped(newDeck.map(card => card.id));

      // 5. 프리뷰 지속
      await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAYS.PREVIEW_DURATION));

      // 6. 모든 카드를 한 번에 다시 덮기
      setFlipped([]);

  // 7. 바로 게임 시작
      setGameState(GAME_STATES.PLAYING);
      setStartedAt(Date.now());
      setLiveMessage('카드를 찾아보세요!');

    } catch (error) {
      console.error('Game initialization failed:', error);
      setLiveMessage('게임 초기화에 실패했습니다.');
    }
  }, [pairCount, createDeck]);

  // 게임 재시작
  const restartGame = useCallback(() => {
    setInitKey(prev => prev + 1);
  }, []);

  // 카드 클릭 핸들러
  const handleCardClick = useCallback((id) => {
    if (gameState !== GAME_STATES.PLAYING) return;
    
    const card = cards.find(c => c.id === id);
    if (!card) return;
    
    const isFlipped = flipped.includes(id);
    const isMatched = matchedPairs.has(card.pairId);
    if (isMatched || isFlipped) return;

    const nextFlipped = [...flipped, id];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves(prev => prev + 1);
      
      const [aId, bId] = nextFlipped;
      const cardA = cards.find(c => c.id === aId);
      const cardB = cards.find(c => c.id === bId);
      const isMatch = cardA && cardB && cardA.pairId === cardB.pairId;

      if (isMatch) {
        // 매치 성공 (추가 하이라이트 효과 제거)
        setLiveMessage('매치 성공!');
        setTimeout(() => setLiveMessage(''), 800);
        setTimeout(() => {
          setMatchedPairs(prev => new Set(prev).add(cardA.pairId));
          setFlipped([]);
        }, 350);
      } else {
        // 매치 실패
        setMismatchedIds(new Set([aId, bId]));
        setLiveMessage('매치가 아니에요. 다시 시도해보세요.');
        
        // 햅틱 피드백
        if (navigator.vibrate) {
          try { navigator.vibrate(50); } catch (_) {}
        }
        
        setTimeout(() => {
          setMismatchedIds(new Set());
          setFlipped([]);
          setLiveMessage('');
        }, 600);
      }
    }
  }, [cards, flipped, matchedPairs, gameState]);

  // 게임 종료 체크
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return;
    
    if (matchedPairs.size === pairCount && pairCount > 0) {
      setGameState(GAME_STATES.FINISHED);
      
      const duration = startedAt ? Math.max(0, Date.now() - startedAt) : moves * 800;
      const timeBonus = Math.max(0, Math.floor(pairCount * 50 - duration / 1000));
      const score = Math.max(0, Math.floor(pairCount * 100 - moves * 5 + timeBonus));
      
      setLiveMessage(`게임 완료! 이동 ${moves}회, 점수 ${score}점으로 게임 완료!`);
      setTimeout(() => setLiveMessage(''), 1500);
      
      onGameEnd?.({ score, moves, pairs: pairCount, durationMs: duration });
    }
  }, [matchedPairs, pairCount, moves, onGameEnd, startedAt, gameState]);

  // 카드 상태 계산
  const getCardState = useCallback((card) => {
    const isFlipped = flipped.includes(card.id);
    const isMatched = matchedPairs.has(card.pairId);
    return { isFlipped: isFlipped || isMatched, isMatched };
  }, [flipped, matchedPairs]);

  return {
    // 상태
    gameState,
    cards,
    moves,
    liveMessage,
    mismatchedIds,
    initKey,
    
    // 메서드
    initializeGame,
    restartGame,
    handleCardClick,
    getCardState,
    
    // 상수
    GAME_STATES
  };
};
