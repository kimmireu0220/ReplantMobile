import { useRef } from 'react';
import { PHYSICS, PLAYER } from '../constants/gameConstants';

/**
 * 게임 물리 로직 Hook
 * GameCanvas.jsx에서 물리 처리 로직 분리
 */
export const useGamePhysics = ({ width, height }) => {
  // 물리 상태 refs
  const velocityYRef = useRef(0);
  const isJumpingRef = useRef(false);
  const jumpCountRef = useRef(0);
  const coyoteMsRef = useRef(0);
  const jumpBufferMsRef = useRef(0);

  // 점프 처리
  const jump = () => {
    jumpBufferMsRef.current = PHYSICS.JUMP_BUFFER_MS;
  };

  // 물리 업데이트
  const updatePhysics = (player, groundTop, delta, gameOverRef) => {
    if (gameOverRef.current) return;

    const deltaSec = delta / 1000;

    // 코요테/버퍼 타이머 업데이트
    coyoteMsRef.current = Math.max(0, coyoteMsRef.current - delta);
    jumpBufferMsRef.current = Math.max(0, jumpBufferMsRef.current - delta);

    // 지면 판정
    const onGround = player.y >= groundTop - 0.5;
    if (onGround) {
      coyoteMsRef.current = PHYSICS.COYOTE_TIME_MS;
    }

    // 점프 목표 정점 높이 계산
    const desiredJumpApex = Math.max(height * 0.28, PLAYER.HEIGHT * 2.5);
    const jumpVelocityEff = Math.min(
      PHYSICS.BASE_JUMP_VELOCITY, 
      Math.sqrt(2 * PHYSICS.GRAVITY * desiredJumpApex)
    );

    // 점프 버퍼 소비
    if (jumpBufferMsRef.current > 0) {
      if (onGround || coyoteMsRef.current > 0) {
        // 1단 점프
        isJumpingRef.current = true;
        velocityYRef.current = -jumpVelocityEff;
        jumpCountRef.current = 1;
        jumpBufferMsRef.current = 0;
      } else if (jumpCountRef.current < PHYSICS.MAX_JUMP_COUNT) {
        // 2단 점프
        isJumpingRef.current = true;
        velocityYRef.current = -jumpVelocityEff;
        jumpCountRef.current += 1;
        jumpBufferMsRef.current = 0;
      }
    }

    // 중력 및 위치 업데이트
    if (isJumpingRef.current) {
      velocityYRef.current += PHYSICS.GRAVITY * deltaSec;
      player.y += velocityYRef.current * deltaSec;
      
      // 상단 경계 클램프
      const ceilingY = Math.floor(height * 0.05);
      if (player.y < ceilingY) {
        player.y = ceilingY;
        if (velocityYRef.current < 0) velocityYRef.current = 0;
      }
      
      // 착지 처리
      if (player.y >= groundTop) {
        player.y = groundTop;
        velocityYRef.current = 0;
        isJumpingRef.current = false;
        jumpCountRef.current = 0;
      }
    } else {
      // 지면에 있을 때 아이들 바운스
      const t = Date.now() / 1000;
      const idleOffset = Math.sin(t * 3) * 4;
      player.y = groundTop + idleOffset;
    }
  };

  // 충돌 감지
  const checkCollision = (player, obstacles) => {
    const getHitbox = (obj, type) => {
      const shrinkX = type === 'player' ? PLAYER.HITBOX_SHRINK : 0.1;
      const shrinkY = type === 'player' ? 0.1 : 0.1;
      const nx = obj.x + obj.width * shrinkX * 0.5;
      const ny = obj.y + obj.height * shrinkY * 0.5;
      const nw = obj.width * (1 - shrinkX);
      const nh = obj.height * (1 - shrinkY);
      return { x: nx, y: ny, width: nw, height: nh };
    };

    const aabb = (a, b) => (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );

    for (let i = 0; i < obstacles.length; i += 1) {
      const obstacle = obstacles[i];
      const playerHB = getHitbox(player, 'player');
      const obstacleHB = getHitbox(obstacle, 'obstacle');
      
      if (aabb(playerHB, obstacleHB)) {
        return true;
      }
    }
    
    return false;
  };

  // 리셋 함수
  const resetPhysics = () => {
    velocityYRef.current = 0;
    isJumpingRef.current = false;
    jumpCountRef.current = 0;
    coyoteMsRef.current = 0;
    jumpBufferMsRef.current = 0;
  };

  return {
    jump,
    updatePhysics,
    checkCollision,
    resetPhysics,
    // 상태 접근용 (읽기 전용)
    get isJumping() { return isJumpingRef.current; },
    get jumpCount() { return jumpCountRef.current; }
  };
};