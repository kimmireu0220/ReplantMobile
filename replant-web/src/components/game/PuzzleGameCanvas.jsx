import React, { useRef, useEffect, useCallback, useState } from 'react';
// import { tokens } from '../../design/tokens';

const BOARD_SIZE = 8;
const BASE_CELL_SIZE = 50;
let CELL_SIZE = BASE_CELL_SIZE;
const SEED_TYPES = 6;

// 씨앗 색상 팔레트 (더 구분되는 색상)
const SEED_COLORS = [
  '#E74C3C', // 빨강 (더 진한)
  '#3498DB', // 파랑 (더 선명한)
  '#2ECC71', // 초록 (더 선명한)
  '#F39C12', // 주황 (노랑 대신)
  '#9B59B6', // 보라 (더 진한)
  '#1ABC9C', // 청록 (더 선명한)
];

// 씨앗 패턴/모양 (색상과 함께 구분 요소)
// const SEED_PATTERNS = [
//   { emoji: '🔴', shape: 'circle' },
//   { emoji: '🔵', shape: 'circle' },
//   { emoji: '🟢', shape: 'circle' },
//   { emoji: '🟠', shape: 'circle' },
//   { emoji: '🟣', shape: 'circle' },
//   { emoji: '🔘', shape: 'circle' },
// ];

// 씨앗 이모지 (미래 확장용)
// const SEED_EMOJIS = ['🌰', '🌰', '🌰', '🌰', '🌰', '🌰'];

const PuzzleGameCanvas = ({ 
  onStatusChange, 
  restartKey = 0,
  isPaused = false
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });

  // 게임 상태
  const [gameState, setGameState] = useState({
    board: [],
    score: 0,
    level: 1,
    timeLeft: 60, // 60초 제한
    gameOver: false,
    selectedCells: [],
    isConnecting: false,
    combo: 0,
    animations: []
  });

  // 초기 매치 제거
  const removeInitialMatches = useCallback((board) => {
    let hasMatches = true;
    while (hasMatches) {
      hasMatches = false;
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (checkForMatch(board, row, col)) {
            board[row][col].type = Math.floor(Math.random() * SEED_TYPES);
            hasMatches = true;
          }
        }
      }
    }
  }, []);

  // 보드 초기화
  const initializeBoard = useCallback(() => {
    const board = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      board[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        board[row][col] = {
          type: Math.floor(Math.random() * SEED_TYPES),
          id: `${row}-${col}-${Date.now()}-${Math.random()}`,
          animating: false,
          matched: false
        };
      }
    }
    
    // 초기 매치가 있는지 확인하고 제거
    removeInitialMatches(board);
    return board;
  }, [removeInitialMatches]);

  // 매치 확인
  const checkForMatch = (board, row, col) => {
    const type = board[row][col].type;
    
    // 가로 매치 확인
    let horizontalCount = 1;
    // 왼쪽 확인
    for (let i = col - 1; i >= 0 && board[row][i].type === type; i--) {
      horizontalCount++;
    }
    // 오른쪽 확인
    for (let i = col + 1; i < BOARD_SIZE && board[row][i].type === type; i++) {
      horizontalCount++;
    }

    // 세로 매치 확인
    let verticalCount = 1;
    // 위쪽 확인
    for (let i = row - 1; i >= 0 && board[i][col].type === type; i--) {
      verticalCount++;
    }
    // 아래쪽 확인
    for (let i = row + 1; i < BOARD_SIZE && board[i][col].type === type; i++) {
      verticalCount++;
    }

    return horizontalCount >= 3 || verticalCount >= 3;
  };

  // 연결된 셀들 찾기
  const findConnectedCells = useCallback((board, startRow, startCol, targetType, visited = new Set()) => {
    const key = `${startRow},${startCol}`;
    if (visited.has(key) || 
        startRow < 0 || startRow >= BOARD_SIZE || 
        startCol < 0 || startCol >= BOARD_SIZE ||
        board[startRow][startCol].type !== targetType) {
      return [];
    }

    visited.add(key);
    const connected = [{ row: startRow, col: startCol }];

    // 인접한 4방향 확인
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    directions.forEach(([dr, dc]) => {
      const newRow = startRow + dr;
      const newCol = startCol + dc;
      connected.push(...findConnectedCells(board, newRow, newCol, targetType, visited));
    });

    return connected;
  }, []);

  // 매치 처리
  const processMatches = useCallback((selectedCells) => {
    if (selectedCells.length < 2) return false;

    setGameState(prev => {
      const newBoard = prev.board.map(row => [...row]);
      let totalScore = 0;

      // 선택된 셀들 제거 (2개 연결: 20점, 3개 이상: 개수 x 15점)
      const baseScore = selectedCells.length === 2 ? 20 : selectedCells.length * 15;
      selectedCells.forEach(({ row, col }) => {
        if (newBoard[row] && newBoard[row][col]) {
          newBoard[row][col].matched = true;
        }
      });
      totalScore = baseScore;

      // 콤보 보너스
      const comboBonus = prev.combo * 50;
      totalScore += comboBonus;

      // 위의 씨앗들을 아래로 떨어뜨리기
      for (let col = 0; col < BOARD_SIZE; col++) {
        const column = [];
        for (let row = BOARD_SIZE - 1; row >= 0; row--) {
          if (!newBoard[row][col].matched) {
            column.unshift(newBoard[row][col]);
          }
        }
        
        // 새로운 씨앗들로 빈 공간 채우기
        while (column.length < BOARD_SIZE) {
          column.push({
            type: Math.floor(Math.random() * SEED_TYPES),
            id: `new-${col}-${Date.now()}-${Math.random()}`,
            animating: false,
            matched: false
          });
        }

        // 열 재배치
        for (let row = 0; row < BOARD_SIZE; row++) {
          newBoard[row][col] = column[row];
        }
      }

      const newScore = prev.score + totalScore;
      const newCombo = prev.combo + 1;

      return {
        ...prev,
        board: newBoard,
        score: newScore,
        combo: newCombo,
        selectedCells: [],
        isConnecting: false
      };
    });

    return true;
  }, []);

  // 마우스/터치 이벤트 처리
  const handleMouseDown = useCallback((e) => {
    if (gameState.gameOver || isPaused) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
      const cellType = gameState.board[row][col].type;
      const connected = findConnectedCells(gameState.board, row, col, cellType);
      
      setGameState(prev => ({
        ...prev,
        selectedCells: connected,
        isConnecting: true
      }));
    }
  }, [gameState.board, gameState.gameOver, isPaused, findConnectedCells]);

  const handleMouseUp = useCallback(() => {
    if (gameState.isConnecting && gameState.selectedCells.length > 0) {
      const success = processMatches(gameState.selectedCells);
      if (!success) {
        setGameState(prev => ({
          ...prev,
          selectedCells: [],
          isConnecting: false,
          combo: 0
        }));
      }
    }
  }, [gameState.isConnecting, gameState.selectedCells, processMatches]);

  // 렌더링
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // 배경
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // 격자 그리기
    ctx.strokeStyle = '#E9ECEF';
    ctx.lineWidth = 1;
    for (let i = 0; i <= BOARD_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvasSize.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvasSize.width, i * CELL_SIZE);
      ctx.stroke();
    }

    // 씨앗들 그리기
    gameState.board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = colIndex * CELL_SIZE;
        const y = rowIndex * CELL_SIZE;
        
        // 선택된 셀 하이라이트
        const isSelected = gameState.selectedCells.some(
          selected => selected.row === rowIndex && selected.col === colIndex
        );
        
        if (isSelected) {
          ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }

        // 씨앗 그리기 (향상된 시각적 구분)
        const seedColor = SEED_COLORS[cell.type];
        const centerX = x + CELL_SIZE / 2;
        const centerY = y + CELL_SIZE / 2;
        const radius = CELL_SIZE / 3;

        // 메인 씨앗 색상
        ctx.fillStyle = seedColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        // 상단 하이라이트 (3D 효과)
        const gradient = ctx.createRadialGradient(
          centerX - 4, centerY - 4, 0,
          centerX, centerY, radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        // 각 타입별 고유 패턴 추가
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        switch (cell.type) {
          case 0: // 빨강 - 원점
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
            ctx.fill();
            break;
          case 1: // 파랑 - 십자
            ctx.fillRect(centerX - 6, centerY - 1, 12, 2);
            ctx.fillRect(centerX - 1, centerY - 6, 2, 12);
            break;
          case 2: // 초록 - 다이아몬드
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 6);
            ctx.lineTo(centerX + 6, centerY);
            ctx.lineTo(centerX, centerY + 6);
            ctx.lineTo(centerX - 6, centerY);
            ctx.closePath();
            ctx.fill();
            break;
          case 3: // 주황 - 사각형
            ctx.fillRect(centerX - 4, centerY - 4, 8, 8);
            break;
          case 4: // 보라 - 삼각형
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 6);
            ctx.lineTo(centerX - 5, centerY + 4);
            ctx.lineTo(centerX + 5, centerY + 4);
            ctx.closePath();
            ctx.fill();
            break;
          case 5: // 청록 - 별
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
              const x1 = centerX + Math.cos(angle) * 6;
              const y1 = centerY + Math.sin(angle) * 6;
              if (i === 0) ctx.moveTo(x1, y1);
              else ctx.lineTo(x1, y1);
            }
            ctx.closePath();
            ctx.fill();
            break;
          default:
            // 기본 원점
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
            ctx.fill();
            break;
        }

        // 하단 그림자 효과
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(centerX + 1, centerY + radius - 2, radius - 2, 3, 0, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // 실패 표시 제거 (요청에 따라 캔버스에는 0X를 표시하지 않음)

    // 연결 라인 그리기
    if (gameState.selectedCells.length > 1) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      gameState.selectedCells.forEach((cell, index) => {
        const x = cell.col * CELL_SIZE + CELL_SIZE / 2;
        const y = cell.row * CELL_SIZE + CELL_SIZE / 2;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }
  }, [gameState.board, gameState.selectedCells, canvasSize]);

  // 게임 루프
  const gameLoop = useCallback(() => {
    if (!isPaused && !gameState.gameOver) {
      render();
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [render, isPaused, gameState.gameOver]);

  // 타이머 로직
  useEffect(() => {
    if (!gameState.gameOver && gameState.timeLeft > 0 && !isPaused) {
      const timer = setInterval(() => {
        setGameState(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          const gameOver = newTimeLeft <= 0;
          
          return {
            ...prev,
            timeLeft: newTimeLeft,
            gameOver
          };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState.gameOver, gameState.timeLeft, isPaused]);

  // 캔버스 크기 계산 및 업데이트
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // 500px 최대 폭 (다른 UI 요소들과 일치)
        const targetWidth = Math.min(containerWidth, 500);
        const size = Math.floor(targetWidth / BOARD_SIZE) * BOARD_SIZE; // 8의 배수로 맞춤
        
        CELL_SIZE = size / BOARD_SIZE;
        
        setCanvasSize({ width: size, height: size });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // 게임 상태 변화 알림
  useEffect(() => {
    onStatusChange({
      score: gameState.score,
      level: gameState.level,
      timeLeft: gameState.timeLeft,
      gameOver: gameState.gameOver,
      combo: gameState.combo
    });
  }, [gameState.score, gameState.level, gameState.timeLeft, gameState.gameOver, gameState.combo, onStatusChange]);

  // 게임 초기화
  useEffect(() => {
    const initialBoard = initializeBoard();
    setGameState(prev => ({
      ...prev,
      board: initialBoard,
      score: 0,
      level: 1,
      timeLeft: 60, // 60초로 초기화
      gameOver: false,
      selectedCells: [],
      isConnecting: false,
      combo: 0
    }));
  }, [restartKey, initializeBoard]);

  // 게임 루프 시작
  useEffect(() => {
    gameLoop();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  // 이벤트 리스너 등록
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      handleMouseDown(mouseEvent);
    });
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleMouseUp();
    });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseUp]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        width: '100%',
        maxWidth: '500px'
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          border: '2px solid #DEE2E6',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          cursor: gameState.gameOver ? 'default' : 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: canvasSize.width,
          height: canvasSize.height
        }}
      />
    </div>
  );
};

export default PuzzleGameCanvas;