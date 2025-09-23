import { COLORS, OBSTACLE_TYPES } from '../../../constants/gameConstants';
import { tokens } from '../../../design/tokens';

/**
 * 게임 렌더링 함수들
 * GameCanvas.jsx에서 분리
 */

// 구름 렌더링 함수
export const drawCloud = (ctx, x, y, size, opacity = 0.8) => {
  ctx.fillStyle = `rgba(200, 200, 255, ${opacity})`;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.3, 0, 2 * Math.PI);
  ctx.arc(x + size * 0.4, y, size * 0.4, 0, 2 * Math.PI);
  ctx.arc(x + size * 0.8, y, size * 0.3, 0, 2 * Math.PI);
  ctx.arc(x + size * 0.2, y - size * 0.2, size * 0.3, 0, 2 * Math.PI);
  ctx.arc(x + size * 0.6, y - size * 0.2, size * 0.3, 0, 2 * Math.PI);
  ctx.fill();
};

// 장애물 렌더링 함수
export const drawObstacle = (ctx, obstacle, type = OBSTACLE_TYPES.DEFAULT) => {
  const { x, y, width, height } = obstacle;
  
  switch (type) {
    case OBSTACLE_TYPES.SPIKE:
      drawSpike(ctx, { x, y, width, height });
      break;
    case OBSTACLE_TYPES.ROCK:
      drawRock(ctx, { x, y, width, height });
      break;
    case OBSTACLE_TYPES.CRYSTAL:
      drawCrystal(ctx, { x, y, width, height });
      break;
    case OBSTACLE_TYPES.ANTIJUMP:
      drawAntiJump(ctx, { x, y, width, height });
      break;
    default:
      drawDefaultBlock(ctx, { x, y, width, height });
      break;
  }
};

// 가시 모양 장애물
const drawSpike = (ctx, { x, y, width, height }) => {
  ctx.fillStyle = COLORS.OBSTACLES.SPIKE;
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x + width / 2, y);
  ctx.lineTo(x + width, y + height);
  ctx.closePath();
  ctx.fill();
  
  // 가시 디테일
  ctx.fillStyle = COLORS.OBSTACLES.SPIKE_DETAIL;
  ctx.fillRect(x + width * 0.3, y + height * 0.3, width * 0.4, height * 0.4);
};

// 바위 모양 장애물
const drawRock = (ctx, { x, y, width, height }) => {
  ctx.fillStyle = COLORS.OBSTACLES.ROCK;
  ctx.beginPath();
  ctx.arc(x + width / 2, y + height / 2, width / 2, 0, 2 * Math.PI);
  ctx.fill();
  
  // 바위 하이라이트
  ctx.fillStyle = COLORS.OBSTACLES.ROCK_HIGHLIGHT;
  ctx.beginPath();
  ctx.arc(x + width * 0.3, y + height * 0.3, width * 0.2, 0, 2 * Math.PI);
  ctx.fill();
};

// 크리스탈 모양 장애물
const drawCrystal = (ctx, { x, y, width, height }) => {
  ctx.fillStyle = COLORS.OBSTACLES.CRYSTAL;
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width, y + height / 2);
  ctx.lineTo(x + width / 2, y + height);
  ctx.lineTo(x, y + height / 2);
  ctx.closePath();
  ctx.fill();
  
  // 크리스탈 하이라이트
  ctx.fillStyle = COLORS.OBSTACLES.CRYSTAL_HIGHLIGHT;
  ctx.beginPath();
  ctx.moveTo(x + width * 0.4, y + height * 0.2);
  ctx.lineTo(x + width * 0.8, y + height * 0.4);
  ctx.lineTo(x + width * 0.6, y + height * 0.8);
  ctx.lineTo(x + width * 0.2, y + height * 0.6);
  ctx.closePath();
  ctx.fill();
};

// AntiJump 바 장애물
const drawAntiJump = (ctx, { x, y, width, height }) => {
  const barRadius = Math.min(8, height / 2);
  const grad = ctx.createLinearGradient(x, y, x, y + height);
  grad.addColorStop(0, COLORS.OBSTACLES.ANTIJUMP_START);
  grad.addColorStop(1, COLORS.OBSTACLES.ANTIJUMP_END);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + barRadius, y);
  ctx.lineTo(x + width - barRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + barRadius);
  ctx.lineTo(x + width, y + height - barRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - barRadius, y + height);
  ctx.lineTo(x + barRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - barRadius);
  ctx.lineTo(x, y + barRadius);
  ctx.quadraticCurveTo(x, y, x + barRadius, y);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // 상단 하이라이트
  ctx.clip();
  ctx.fillStyle = COLORS.OBSTACLES.ANTIJUMP_HIGHLIGHT;
  ctx.fillRect(x + 2, y + 2, Math.max(0, width - 4), Math.max(1, height / 3));
  ctx.restore();

  // 외곽선
  ctx.strokeStyle = tokens.colors.border.light;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + barRadius, y);
  ctx.lineTo(x + width - barRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + barRadius);
  ctx.lineTo(x + width, y + height - barRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - barRadius, y + height);
  ctx.lineTo(x + barRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - barRadius);
  ctx.lineTo(x, y + barRadius);
  ctx.quadraticCurveTo(x, y, x + barRadius, y);
  ctx.stroke();
};

// 기본 블록 장애물
const drawDefaultBlock = (ctx, { x, y, width, height }) => {
  const gradient = ctx.createLinearGradient(x, y, x, y + height);
  gradient.addColorStop(0, COLORS.OBSTACLES.DEFAULT_START);
  gradient.addColorStop(1, COLORS.OBSTACLES.DEFAULT_END);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
  
  // 블록 하이라이트
  ctx.fillStyle = COLORS.OBSTACLES.DEFAULT_HIGHLIGHT;
  ctx.fillRect(x + 2, y + 2, width - 4, height / 3);
};

// 배경 렌더링 (구름들)
export const renderBackground = (ctx, { width, height, elapsed }) => {
  const t = elapsed / 1000;
  const cloudSpeed = 20;
  const cloudY1 = height * 0.35;
  const cloudY2 = height * 0.5;
  const cloudY3 = height * 0.65;
  
  // 구름 1 (왼쪽에서 오른쪽으로 이동)
  const cloud1X = (t * cloudSpeed) % (width + 100) - 50;
  drawCloud(ctx, cloud1X, cloudY1, 60, 0.9);
  
  // 구름 2 (오른쪽에서 왼쪽으로 이동, 더 느리게)
  const cloud2X = width - ((t * cloudSpeed * 0.7) % (width + 100)) + 50;
  drawCloud(ctx, cloud2X, cloudY2, 80, 0.8);
  
  // 구름 3 (왼쪽에서 오른쪽으로 이동, 중간 속도)
  const cloud3X = (t * cloudSpeed * 1.3) % (width + 120) - 60;
  drawCloud(ctx, cloud3X, cloudY3, 50, 0.7);
};

// 움직이는 바닥 라인 렌더링
export const renderGroundLine = (ctx, { width, height, elapsed }) => {
  const t = elapsed / 1000;
  ctx.strokeStyle = tokens.colors.border.medium;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const baseY = height - Math.floor(height * 0.1);
  
  for (let x = 0; x <= width; x += 12) {
    const y = baseY + Math.sin((x + t * 120) * 0.04) * 2;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  return baseY;
};

// 플레이어 드로잉(공용)
export const drawPlayer = (ctx, { player, image, imageReady, color }) => {
  if (imageReady && image) {
    ctx.drawImage(image, player.x, player.y, player.width, player.height);
    return;
  }
  ctx.fillStyle = color || '#22c55e';
  ctx.fillRect(player.x, player.y, player.width, player.height);
};