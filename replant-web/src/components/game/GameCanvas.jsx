import React, { useEffect, useRef, useCallback } from 'react';
import { tokens } from '../../design/tokens';
import { getCSSVariableValue } from '../../utils/themeUtils';
import { shareOrDownload } from '../../utils/share';

/**
 * 기본 Canvas 렌더링 컴포넌트
 * - 고해상도 디스플레이 대응 (devicePixelRatio)
 * - 디자인 토큰 기반 기본 배경/테두리
 */
const GameCanvas = ({
  width = 600,
  height = 400,
  className = '',
  style = {},
  ariaLabel = '게임 캔버스',
  loopEnabled = true,
  onFrame, // (ctx, { width, height, elapsed, delta }) => void
  // 장애물 옵션
  obstacleSpawnMs = 1800, // 스폰 간격 살짝 빠르게 (2000 → 1800ms)
  obstacleSpeed = 260,
  // 상태 보고 콜백 (HUD용)
  onStatus, // ({ score, distance, lives, gameOver }) => void
  // 플레이어 색상 (캐릭터 연동 대비)
  playerColor,
  // 플레이어 이미지 (대표 캐릭터 스프라이트)
  playerImageSrc,
  // 최고 점수
  highScore = 0,
  // 난이도 스케일링 옵션
  difficultyScale = 0.0005, // 거리(px)당 속도 증가율
  spawnAccel = 0.0002,      // 거리(px)당 스폰 간격 감소율 (완화)
  // 재시작 콜백
  onRestart,
  // 스크린샷 콜백 및 옵션
  onCaptureSuccess,
  onCaptureError,
  includeScoreInCapture = false,
}) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const elapsedRef = useRef(0);
  const playerRef = useRef({ x: 80, y: 0, width: 48, height: 48 });
  const obstaclesRef = useRef([]); // { x, y, width, height }
  const spawnTimerRef = useRef(0);
  const livesRef = useRef(1);
  const invincibleMsRef = useRef(0);
  const distanceRef = useRef(0);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const velocityYRef = useRef(0);
  const isJumpingRef = useRef(false);
  const jumpCountRef = useRef(0); // 2단 점프 지원을 위한 점프 횟수
  const gravity = 5000; // px/s^2 (더욱 강한 중력)
  const baseJumpVelocity = 1300; // px/s (기본 점프 속도 상한)
  const canvasBgColorRef = useRef('#f9fafb');
  const fixedColorsRef = useRef({
    backgroundSecondary: '#f9fafb',
    backgroundPrimary: '#ffffff',
    textSecondary: '#6b7280',
    textPrimary: '#111827',
    borderLight: '#e5e7eb',
    borderMedium: '#d1d5db',
    primary: '#22c55e',
    error: '#ef4444',
  });

  // 게임 시작 시점에 한 번만 테마 변수를 해석하여 고정값으로 저장
  useEffect(() => {
    try {
      const get = (name, fallback) => getCSSVariableValue(name) || fallback;
      fixedColorsRef.current = {
        backgroundSecondary: get('--color-background-secondary', '#f9fafb'),
        backgroundPrimary: get('--color-background-primary', '#ffffff'),
        textSecondary: get('--color-text-secondary', '#6b7280'),
        textPrimary: get('--color-text-primary', '#111827'),
        borderLight: get('--color-border-light', '#e5e7eb'),
        borderMedium: get('--color-border-medium', '#d1d5db'),
        primary: get('--color-primary-500', '#22c55e'),
        error: get('--color-error', '#ef4444'),
      };
      canvasBgColorRef.current = fixedColorsRef.current.backgroundSecondary;
    } catch (_) {
      // 무시: fallback 사용
    }
  }, []);

  // 난이도/속도 상한 설정
  const MAX_SPEED_MULTIPLIER = 10.0; // 기본 속도의 최대 배수 제한 (상향)
  const MIN_SPAWN_MS = 800;         // 스폰 간격의 하한 (완화)
  const MAX_SPAWN_REDUCTION = 0.5;  // 스폰 간격 감소의 최대 비율 (완화)
  const DOUBLE_SPAWN_GRACE_MS = 6000; // 게임 시작 후 6초 동안은 더블 장애물 금지
  const TRIPLE_SPAWN_GRACE_MS = 12000; // 게임 시작 후 12초 동안은 트리플 장애물 금지
  const TALL_SPAWN_GRACE_MS = 5000;  // 게임 시작 후 5초 동안은 초고층 장애물 금지 (단축)
  const LONG_SPAWN_GRACE_MS = 15000; // 게임 시작 후 15초 동안은 초장폭 장애물 금지
  const ANTIJUMP_SPAWN_GRACE_MS = 8000; // 게임 시작 후 8초 동안은 AntiJump 금지
  const COYOTE_TIME_MS = 120;        // 지면 이탈 후 점프 유예 시간
  const JUMP_BUFFER_MS = 120;        // 점프 입력 버퍼 시간
  const MIN_REACTION_MS = 380;       // 연속 스폰 사이 최소 반응 시간
  const pausedRef = useRef(false);
  const playerImageRef = useRef(null);
  const playerImageReadyRef = useRef(false);
  const hitTextRef = useRef({ show: false, x: 0, y: 0, timer: 0 });
  const gameStartedRef = useRef(false);
  const gameActiveRef = useRef(false);
  const coyoteMsRef = useRef(0);
  const jumpBufferMsRef = useRef(0);
  const lastSpawnAtRef = useRef(0);
  const cameraHitboxRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const captureInProgressRef = useRef(false);

  // 구름 렌더링 함수
  const drawCloud = (ctx, x, y, size, opacity = 0.8) => {
    ctx.fillStyle = `rgba(200, 200, 255, ${opacity})`; // 연한 파란색 구름
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, 2 * Math.PI);
    ctx.arc(x + size * 0.4, y, size * 0.4, 0, 2 * Math.PI);
    ctx.arc(x + size * 0.8, y, size * 0.3, 0, 2 * Math.PI);
    ctx.arc(x + size * 0.2, y - size * 0.2, size * 0.3, 0, 2 * Math.PI);
    ctx.arc(x + size * 0.6, y - size * 0.2, size * 0.3, 0, 2 * Math.PI);
    ctx.fill();
  };

  // 장애물 렌더링 함수
  const drawObstacle = (ctx, obstacle, type = 'default') => {
    const { x, y, width, height } = obstacle;
    
    switch (type) {
      case 'spike':
        // 가시 모양 장애물
        ctx.fillStyle = '#8B4513'; // 갈색
        ctx.beginPath();
        ctx.moveTo(x, y + height);
        ctx.lineTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height);
        ctx.closePath();
        ctx.fill();
        
        // 가시 디테일
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + width * 0.3, y + height * 0.3, width * 0.4, height * 0.4);
        break;
        
      case 'rock':
        // 바위 모양 장애물
        ctx.fillStyle = '#696969'; // 회색
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height / 2, width / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // 바위 하이라이트
        ctx.fillStyle = '#A9A9A9';
        ctx.beginPath();
        ctx.arc(x + width * 0.3, y + height * 0.3, width * 0.2, 0, 2 * Math.PI);
        ctx.fill();
        break;
        
      case 'crystal':
        // 크리스탈 모양 장애물
        ctx.fillStyle = '#FF69B4'; // 핑크
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height / 2);
        ctx.lineTo(x + width / 2, y + height);
        ctx.lineTo(x, y + height / 2);
        ctx.closePath();
        ctx.fill();
        
        // 크리스탈 하이라이트
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.moveTo(x + width * 0.4, y + height * 0.2);
        ctx.lineTo(x + width * 0.8, y + height * 0.4);
        ctx.lineTo(x + width * 0.6, y + height * 0.8);
        ctx.lineTo(x + width * 0.2, y + height * 0.6);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'antijump':
        // 점프 금지 바: 게임 스타일과 통일된 레드 그라데이션 + 하이라이트
        const barRadius = Math.min(8, height / 2);
        const grad = ctx.createLinearGradient(x, y, x, y + height);
        grad.addColorStop(0, '#FF6B6B');
        grad.addColorStop(1, '#C44569');

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

        // 상단 하이라이트(클리핑 내부)
        ctx.clip();
        ctx.fillStyle = '#FF8E8E';
        ctx.fillRect(x + 2, y + 2, Math.max(0, width - 4), Math.max(1, height / 3));
        ctx.restore();

        // 외곽선(미세한 경계)
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
        break;

      default:
        // 기본 블록 모양 (그라데이션)
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, '#FF6B6B'); // 빨간색
        gradient.addColorStop(1, '#C44569'); // 어두운 빨간색
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
        
        // 블록 하이라이트
        ctx.fillStyle = '#FF8E8E';
        ctx.fillRect(x + 2, y + 2, width - 4, height / 3);
        break;
    }
  };

  // 카메라 아이콘 렌더링 (다크/라이트 모드 대비 자동, 더 명확한 카메라 형태)
  const drawCameraIcon = (ctx, { x, y, size }) => {
    const r = size / 2;

    // 배경 명도 측정 후 대비 색상 선택
    const hex = (fixedColorsRef.current.backgroundSecondary || '#1f2937').toLowerCase();
    const parseHex = (h) => {
      const v = h.replace('#', '');
      const n = v.length === 3
        ? v.split('').map((c) => c + c).join('')
        : v;
      const num = parseInt(n, 16);
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
      };
    };
    const { r: rr, g: rg, b: rb } = parseHex(hex);
    const srgb = [rr, rg, rb].map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    const luminance = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    const isDarkBg = luminance < 0.5;

    const circleFill = isDarkBg ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.85)';
    const bodyFill = isDarkBg ? '#111827' : '#ffffff';
    const bodyStroke = isDarkBg ? '#0b1220' : '#e5e7eb';
    const lensStroke = isDarkBg ? '#e5e7eb' : '#111827';
    const flashFill = isDarkBg ? '#ffffff' : '#111827';
    const lensInner = isDarkBg ? '#1f2937' : '#f3f4f6';

    // 배경(원형)
    ctx.fillStyle = circleFill;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = fixedColorsRef.current.borderLight;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 카메라 바디(둥근 사각형)
    const bodyW = size * 0.58;
    const bodyH = size * 0.40;
    const br = Math.min(bodyH * 0.35, 6);
    const bx = x - bodyW / 2;
    const by = y - bodyH / 2;
    ctx.beginPath();
    ctx.moveTo(bx + br, by);
    ctx.lineTo(bx + bodyW - br, by);
    ctx.quadraticCurveTo(bx + bodyW, by, bx + bodyW, by + br);
    ctx.lineTo(bx + bodyW, by + bodyH - br);
    ctx.quadraticCurveTo(bx + bodyW, by + bodyH, bx + bodyW - br, by + bodyH);
    ctx.lineTo(bx + br, by + bodyH);
    ctx.quadraticCurveTo(bx, by + bodyH, bx, by + bodyH - br);
    ctx.lineTo(bx, by + br);
    ctx.quadraticCurveTo(bx, by, bx + br, by);
    ctx.closePath();
    ctx.fillStyle = bodyFill;
    ctx.fill();
    ctx.strokeStyle = bodyStroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 렌즈(이중 원)
    const lensR = bodyH * 0.33;
    ctx.beginPath();
    ctx.arc(x, y, lensR, 0, 2 * Math.PI);
    ctx.strokeStyle = lensStroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, lensR * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = lensInner;
    ctx.fill();
    // 하이라이트 점
    ctx.beginPath();
    ctx.arc(x + lensR * 0.35, y - lensR * 0.35, Math.max(1.5, lensR * 0.15), 0, 2 * Math.PI);
    ctx.fillStyle = isDarkBg ? '#ffffff' : '#9ca3af';
    ctx.fill();

    // 플래시 창(우상단 작은 사각형)
    const fw = bodyW * 0.16;
    const fh = bodyH * 0.18;
    const fx = bx + bodyW - fw - br * 0.5;
    const fy = by + br * 0.4;
    ctx.fillStyle = flashFill;
    ctx.fillRect(fx, fy, fw, fh);
  };

  const pointInRect = (px, py, rect) => (
    px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h
  );

  // 오프스크린 캡처 유틸
  const toBlobPromise = (cnv) => {
    if (typeof cnv.convertToBlob === 'function') {
      return cnv.convertToBlob({ type: 'image/png' });
    }
    if (typeof cnv.toBlob === 'function') {
      return new Promise((resolve, reject) =>
        cnv.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
      );
    }
    return new Promise((resolve, reject) => {
      try {
        const dataUrl = cnv.toDataURL('image/png');
        fetch(dataUrl).then((res) => res.blob()).then(resolve).catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  };

  const captureGameScreenshot = useCallback(async ({ includeScore = false } = {}) => {
    const dpr = window.devicePixelRatio || 1;
    const off = window.OffscreenCanvas
      ? new OffscreenCanvas(Math.floor(width * dpr), Math.floor(height * dpr))
      : (() => {
          const c = document.createElement('canvas');
          c.width = Math.floor(width * dpr);
          c.height = Math.floor(height * dpr);
          return c;
        })();

    const ctx = off.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const elapsed = elapsedRef.current;
    const player = { ...playerRef.current };
    const obstacles = obstaclesRef.current.map((o) => ({ ...o }));

    ctx.fillStyle = canvasBgColorRef.current;
    ctx.fillRect(0, 0, width, height);

    const t = elapsed / 1000;
    const cloudSpeed = 20;
    const cloudY1 = height * 0.35;
    const cloudY2 = height * 0.5;
    const cloudY3 = height * 0.65;
    const drawCloudLocal = (cx, cy, size, opacity = 0.8) => {
      ctx.fillStyle = `rgba(200, 200, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.3, 0, 2 * Math.PI);
      ctx.arc(cx + size * 0.4, cy, size * 0.4, 0, 2 * Math.PI);
      ctx.arc(cx + size * 0.8, cy, size * 0.3, 0, 2 * Math.PI);
      ctx.arc(cx + size * 0.2, cy - size * 0.2, size * 0.3, 0, 2 * Math.PI);
      ctx.arc(cx + size * 0.6, cy - size * 0.2, size * 0.3, 0, 2 * Math.PI);
      ctx.fill();
    };
    drawCloudLocal((t * cloudSpeed) % (width + 100) - 50, cloudY1, 60, 0.9);
    drawCloudLocal(width - ((t * cloudSpeed * 0.7) % (width + 100)) + 50, cloudY2, 80, 0.8);
    drawCloudLocal((t * cloudSpeed * 1.3) % (width + 120) - 60, cloudY3, 50, 0.7);

    ctx.strokeStyle = tokens.colors.border.medium;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const baseY = height - Math.floor(height * 0.1);
    for (let x = 0; x <= width; x += 12) {
      const y = baseY + Math.sin((x + t * 120) * 0.04) * 2;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    const groundTop = baseY - player.height;
    player.y = Math.min(player.y, groundTop);

    if (playerImageReadyRef.current && playerImageRef.current) {
      ctx.drawImage(playerImageRef.current, player.x, player.y, player.width, player.height);
    } else {
      ctx.fillStyle = playerColor || fixedColorsRef.current.primary;
      ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    obstacles.forEach((o) => {
      const { x, y, width: w, height: h } = o;
      switch (o.type || 'default') {
        case 'spike':
          ctx.fillStyle = '#8B4513';
          ctx.beginPath();
          ctx.moveTo(x, y + h);
          ctx.lineTo(x + w / 2, y);
          ctx.lineTo(x + w, y + h);
          ctx.closePath();
          ctx.fill();
          break;
        case 'rock':
          ctx.fillStyle = '#696969';
          ctx.beginPath();
          ctx.arc(x + w / 2, y + h / 2, w / 2, 0, 2 * Math.PI);
          ctx.fill();
          break;
        case 'crystal':
          ctx.fillStyle = '#FF69B4';
          ctx.beginPath();
          ctx.moveTo(x + w / 2, y);
          ctx.lineTo(x + w, y + h / 2);
          ctx.lineTo(x + w / 2, y + h);
          ctx.lineTo(x, y + h / 2);
          ctx.closePath();
          ctx.fill();
          break;
        case 'antijump':
          const barRadius = Math.min(8, h / 2);
          const grad = ctx.createLinearGradient(x, y, x, y + h);
          grad.addColorStop(0, '#FF6B6B');
          grad.addColorStop(1, '#C44569');
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x + barRadius, y);
          ctx.lineTo(x + w - barRadius, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + barRadius);
          ctx.lineTo(x + w, y + h - barRadius);
          ctx.quadraticCurveTo(x + w, y + h, x + w - barRadius, y + h);
          ctx.lineTo(x + barRadius, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - barRadius);
          ctx.lineTo(x, y + barRadius);
          ctx.quadraticCurveTo(x, y, x + barRadius, y);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.restore();
          break;
        default:
          const gradient = ctx.createLinearGradient(x, y, x, y + h);
          gradient.addColorStop(0, '#FF6B6B');
          gradient.addColorStop(1, '#C44569');
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, w, h);
          break;
      }
    });

    if (includeScore) {
      ctx.font = `bold ${tokens.typography.fontSize.lg} ${tokens.typography.fontFamily.sans.join(',')}`;
      ctx.fillStyle = fixedColorsRef.current.textPrimary;
      const leftPad = Math.floor(width * 0.04);
      ctx.textAlign = 'left';
      ctx.fillText(`Your Score: ${scoreRef.current.toLocaleString()}`, leftPad, Math.floor(height * 0.15) + 10);
    }

    const blob = await toBlobPromise(off);
    const fileName = `replant-obstacle-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    await shareOrDownload(blob, fileName);
  }, [width, height, playerColor]);

  const jump = () => {
    if (gameOverRef.current || pausedRef.current) return;
    // 입력을 버퍼에 저장하고 물리 업데이트 단계에서 소모
    jumpBufferMsRef.current = JUMP_BUFFER_MS;
  };

  // 캔버스 초기화 및 첫 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 초기 화면
    ctx.fillStyle = canvasBgColorRef.current;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = fixedColorsRef.current.textSecondary;
    ctx.font = `${tokens.typography.fontSize.base} ${tokens.typography.fontFamily.sans.join(',')}`;
    ctx.textAlign = 'center';
    ctx.fillText('게임 캔버스 초기화됨', width / 2, height / 2);
    ctx.strokeStyle = fixedColorsRef.current.borderLight;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
  }, [width, height]);

  // 플레이어 이미지 로드
  useEffect(() => {
    playerImageReadyRef.current = false;
    playerImageRef.current = null;
    gameStartedRef.current = false;
    
    if (!playerImageSrc) {
      // 이미지가 없으면 바로 게임 시작
      gameStartedRef.current = true;
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      playerImageRef.current = img;
      playerImageReadyRef.current = true;
      gameStartedRef.current = true;
      gameActiveRef.current = true; // 게임 활성화
    };
    img.onerror = () => {
      playerImageRef.current = null;
      playerImageReadyRef.current = false;
      gameStartedRef.current = true; // 에러가 나도 게임은 시작
      gameActiveRef.current = true; // 게임 활성화
    };
    img.src = playerImageSrc;
    return () => {
      // 이미지 객체 참조 해제
      playerImageRef.current = null;
      playerImageReadyRef.current = false;
    };
  }, [playerImageSrc]);

  // 입력 처리 (키보드/터치)
  useEffect(() => {
    if (!loopEnabled) return;
    const onKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        // 게임 오버 화면에서는 재시작, 그 외에는 일시정지 토글
        if (gameOverRef.current && onRestart) {
          onRestart();
        } else {
          pausedRef.current = !pausedRef.current;
        }
      }
    };
    const onPointerDown = async (e) => {
      e.preventDefault();
      
      // 게임 오버 상태에서 클릭 시 재시작
      if (gameOverRef.current && onRestart) {
        onRestart();
        return;
      }
      
      // 일시정지 상태에서 카메라 아이콘 터치 처리 우선
      const canvasEl = canvasRef.current;
      if (pausedRef.current && canvasEl) {
        const rect = canvasEl.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        if (pointInRect(px, py, cameraHitboxRef.current)) {
          if (!captureInProgressRef.current) {
            captureInProgressRef.current = true;
            try {
              await captureGameScreenshot({ includeScore: includeScoreInCapture });
              onCaptureSuccess && onCaptureSuccess('screenshot');
            } catch (err) {
              onCaptureError && onCaptureError(err);
            } finally {
              captureInProgressRef.current = false;
            }
          }
          return;
        }
      }

      // 게임 진행 중일 때만 점프
      if (!gameOverRef.current && !pausedRef.current) {
        jump();
      }
    };
    const onVisibility = () => {
      pausedRef.current = document.hidden;
    };
    window.addEventListener('keydown', onKeyDown);
    const canvas = canvasRef.current;
    canvas && canvas.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      canvas && canvas.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [
    loopEnabled,
    onRestart,
    captureGameScreenshot,
    includeScoreInCapture,
    onCaptureError,
    onCaptureSuccess,
  ]);

  // 게임 루프
  useEffect(() => {
    if (!loopEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const step = (time) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const delta = Math.min(64, time - lastTimeRef.current); // ms, 프레임 드롭 보호
      lastTimeRef.current = time;
      
      // 일시정지 상태가 아닐 때만 시간 업데이트
      if (!pausedRef.current) {
        elapsedRef.current += delta;
        if (invincibleMsRef.current > 0) invincibleMsRef.current = Math.max(0, invincibleMsRef.current - delta);
      }

      if (pausedRef.current) {
        // 일시정지 상태일 때 현재 게임 상황을 그대로 렌더링하고 버튼만 오버레이
        // 게임 요소들을 정지된 상태로 렌더링
        const t = elapsedRef.current / 1000;
        ctx.fillStyle = canvasBgColorRef.current;
        ctx.fillRect(0, 0, width, height);

        // 구름 렌더링 (정지된 상태)
        const cloudSpeed = 20;
        const cloudY1 = height * 0.35; // 점수판을 가리지 않도록 낮춤
        const cloudY2 = height * 0.5;  // 중간 구름도 낮춤
        const cloudY3 = height * 0.65; // 아래쪽 구름도 낮춤
        
        // 구름 1 (정지된 상태)
        const cloud1X = (t * cloudSpeed) % (width + 100) - 50;
        drawCloud(ctx, cloud1X, cloudY1, 60, 0.9);
        
        // 구름 2 (정지된 상태)
        const cloud2X = width - ((t * cloudSpeed * 0.7) % (width + 100)) + 50;
        drawCloud(ctx, cloud2X, cloudY2, 80, 0.8);
        
        // 구름 3 (정지된 상태)
        const cloud3X = (t * cloudSpeed * 1.3) % (width + 120) - 60;
        drawCloud(ctx, cloud3X, cloudY3, 50, 0.7);

        // 움직이는 바닥 라인 (정지된 상태)
        ctx.strokeStyle = fixedColorsRef.current.borderMedium;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const baseY = height - Math.floor(height * 0.1);
        for (let x = 0; x <= width; x += 12) {
          const y = baseY + Math.sin((x + t * 120) * 0.04) * 2;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 플레이어 렌더링 (정지된 상태)
        if (playerRef.current) {
          const player = playerRef.current;
          if (playerImageReadyRef.current && playerImageRef.current) {
            ctx.drawImage(playerImageRef.current, player.x, player.y, player.width, player.height);
          } else {
            ctx.fillStyle = playerColor || fixedColorsRef.current.primary;
            ctx.fillRect(player.x, player.y, player.width, player.height);
          }
        }

        // 장애물들 렌더링 (정지된 상태)
        obstaclesRef.current.forEach(obstacle => {
          drawObstacle(ctx, obstacle, obstacle.type || 'default');
        });

        // 점수 렌더링 (정지된 상태)
        const heartY = Math.floor(height * 0.15);

        ctx.font = `bold ${tokens.typography.fontSize.lg} ${tokens.typography.fontFamily.sans.join(',')}`;
        ctx.fillStyle = fixedColorsRef.current.textPrimary;
        const formattedHighScore = highScore.toLocaleString();
        const formattedScore = scoreRef.current.toLocaleString();
        
        const highScoreText = `Best Score: ${formattedHighScore}`;
        const scoreText = `Your Score: ${formattedScore}`;
        
        const leftPad = Math.floor(width * 0.04);
        ctx.textAlign = 'left';
        ctx.fillText(highScoreText, leftPad, heartY - 10);
        ctx.fillText(scoreText, leftPad, heartY + 10);

        // 일시정지 버튼 오버레이 (정중앙) - 게임 오버 상태가 아닐 때만 표시
        if (!gameOverRef.current) {
          const buttonSize = 80;
          const buttonX = width / 2;
          const buttonY = height / 2;
          
          // 버튼 배경 (원형) - 다크모드에서도 잘 보이도록 반투명 배경 강화
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.beginPath();
          ctx.arc(buttonX, buttonY, buttonSize / 2, 0, 2 * Math.PI);
          ctx.fill();
          
          // 버튼 외곽선 (테마에 맞는 색상)
          ctx.strokeStyle = fixedColorsRef.current.borderLight;
          ctx.lineWidth = 1;
          ctx.stroke();
          
          // 일시정지 아이콘 (두 개의 세로 막대) - 테마별 적절한 색상 사용
          ctx.fillStyle = '#ffffff'; // 어두운 배경에 대비되는 흰색 사용
          const barWidth = 4;
          const barHeight = 40;
          const barSpacing = 8;
          ctx.fillRect(buttonX - barSpacing, buttonY - barHeight/2, barWidth, barHeight);
          ctx.fillRect(buttonX + barSpacing - barWidth, buttonY - barHeight/2, barWidth, barHeight);
        }

        // 카메라 아이콘 (우상단) - 일시정지 상태에서만 표시
        const camSize = Math.max(44, Math.floor(height * 0.06));
        const pad = Math.floor(width * 0.04);
        const cx = width - pad - camSize / 2;
        const cy = Math.max(8 + camSize / 2, Math.floor(height * 0.15));
        drawCameraIcon(ctx, { x: cx, y: cy, size: camSize });
        cameraHitboxRef.current = { x: cx - camSize / 2, y: cy - camSize / 2, w: camSize, h: camSize };

        rafRef.current = requestAnimationFrame(step);
        return;
      }

      // 이미지 로드 완료 전까지는 배경만 표시 (문구 없음)
      if (!gameStartedRef.current) {
        ctx.fillStyle = canvasBgColorRef.current;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = fixedColorsRef.current.textSecondary;
        ctx.font = `${tokens.typography.fontSize.base} ${tokens.typography.fontFamily.sans.join(',')}`;
        ctx.textAlign = 'center';
        
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      // 기본 데모 렌더링 또는 외부 onFrame 호출
      if (typeof onFrame === 'function') {
        onFrame(ctx, { width, height, elapsed: elapsedRef.current, delta });
      } else {
        // 간단한 애니메이션 배경 (루프 확인용)
        const t = elapsedRef.current / 1000; // seconds
        ctx.fillStyle = canvasBgColorRef.current;
        ctx.fillRect(0, 0, width, height);

        // 구름 렌더링 (배경)
        const cloudSpeed = 20; // 구름 이동 속도
        const cloudY1 = height * 0.35; // 점수판을 가리지 않도록 낮춤
        const cloudY2 = height * 0.5;  // 중간 구름도 낮춤
        const cloudY3 = height * 0.65; // 아래쪽 구름도 낮춤
        
        // 구름 1 (왼쪽에서 오른쪽으로 이동)
        const cloud1X = (t * cloudSpeed) % (width + 100) - 50;
        drawCloud(ctx, cloud1X, cloudY1, 60, 0.9);
        
        // 구름 2 (오른쪽에서 왼쪽으로 이동, 더 느리게)
        const cloud2X = width - ((t * cloudSpeed * 0.7) % (width + 100)) + 50;
        drawCloud(ctx, cloud2X, cloudY2, 80, 0.8);
        
        // 구름 3 (왼쪽에서 오른쪽으로 이동, 중간 속도)
        const cloud3X = (t * cloudSpeed * 1.3) % (width + 120) - 60;
        drawCloud(ctx, cloud3X, cloudY3, 50, 0.7);

        // 움직이는 바닥 라인
        ctx.strokeStyle = fixedColorsRef.current.borderMedium;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const baseY = height - Math.floor(height * 0.1); // 화면 높이의 10%
        for (let x = 0; x <= width; x += 12) {
          const y = baseY + Math.sin((x + t * 120) * 0.04) * 2;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 플레이어 초기화 (첫 실행 시)
        if (!playerRef.current) {
          const playerSize = Math.floor(Math.min(width, height) * 0.08);
          playerRef.current = {
            x: Math.floor(width * 0.05), // 화면 너비의 5%
            y: baseY - playerSize,
            width: playerSize,
            height: playerSize,
          };
        }

        // 플레이어 (기본 사각형, 아이들 바운스)
        const player = playerRef.current;
        const groundTop = baseY - player.height; // 바닥 위에 놓기
        const idleOffset = Math.sin(t * 3) * 4; // 아이들 애니메이션

        // 게임 활성화 시 자동 시작
        if (gameActiveRef.current && !gameOverRef.current && !gameStartedRef.current) {
          gameStartedRef.current = true;
        }

        // 물리 업데이트 + 코요테/버퍼 처리
        if (!gameOverRef.current) {
          const deltaSec = delta / 1000;

          // 코요테/버퍼 타이머 업데이트
          coyoteMsRef.current = Math.max(0, coyoteMsRef.current - delta);
          jumpBufferMsRef.current = Math.max(0, jumpBufferMsRef.current - delta);

          // 지면 판정
          const onGround = player.y >= groundTop - 0.5;
          if (onGround) {
            coyoteMsRef.current = COYOTE_TIME_MS;
          }

          // 점프 목표 정점 높이를 화면 비율에 맞게 산정하고 유효 점프 속도 계산
          const desiredJumpApex = Math.max(height * 0.28, (player.height || 40) * 2.5); // 화면의 약 28% 또는 플레이어의 2.5배 높이
          const jumpVelocityEff = Math.min(baseJumpVelocity, Math.sqrt(2 * gravity * desiredJumpApex));

          // 점프 버퍼 소비: 지면 또는 코요테 타임 내면 1단 점프, 아니면 2단 점프 허용
          if (jumpBufferMsRef.current > 0) {
            if (onGround || coyoteMsRef.current > 0) {
              isJumpingRef.current = true;
              velocityYRef.current = -jumpVelocityEff;
              jumpCountRef.current = 1; // 첫 점프
              jumpBufferMsRef.current = 0;
            } else if (jumpCountRef.current < 2) {
              isJumpingRef.current = true;
              velocityYRef.current = -jumpVelocityEff;
              jumpCountRef.current += 1; // 2단 점프
              jumpBufferMsRef.current = 0;
            }
          }

          // 중력 및 위치 업데이트
          if (isJumpingRef.current) {
            velocityYRef.current += gravity * deltaSec;
            player.y += velocityYRef.current * deltaSec;
            // 상단 경계 클램프(모바일 작은 화면 보호)
            const ceilingY = Math.floor(height * 0.05); // 상단 5%는 여백으로 남김
            if (player.y < ceilingY) {
              player.y = ceilingY;
              // 위로 더 가지 않도록 상승 속도를 제거
              if (velocityYRef.current < 0) velocityYRef.current = 0;
            }
            if (player.y >= groundTop) {
              player.y = groundTop;
              velocityYRef.current = 0;
              isJumpingRef.current = false;
              jumpCountRef.current = 0; // 착지 시 점프 횟수 초기화
            }
          } else {
            // 지면에 있을 때는 아이들 바운스를 시각효과로만 적용
            player.y = groundTop + idleOffset;
          }
        } else {
          // 게임 오버 시 지면 아래로 내려가지 않도록 보정
          player.y = Math.min(player.y, groundTop);
        }

        // 충돌 시 시각적 피드백
        const isBlinking = invincibleMsRef.current > 0 && Math.floor(elapsedRef.current / 80) % 2 === 0;
        
        // 이미지가 로드된 경우에만 캐릭터 표시
        if (playerImageReadyRef.current && playerImageRef.current) {
          // 이미지 그리기 (깜빡임 효과)
          if (!isBlinking) {
            // 깜빡이지 않을 때만 이미지 그리기
            ctx.drawImage(
              playerImageRef.current,
              player.x,
              player.y,
              player.width,
              player.height
            );
          }
        }
        // 이미지가 로드되지 않은 경우 캐릭터를 표시하지 않음

        // 장애물 업데이트/렌더 (게임 오버 상태에서도 계속 스폰)
        spawnTimerRef.current += delta;
        // 난이도에 따른 동적 스폰 간격 (하한 보장, 최대 60% 감소)
        const spawnReduction = Math.min(MAX_SPAWN_REDUCTION, distanceRef.current * spawnAccel);
        const effectiveSpawn = Math.max(MIN_SPAWN_MS, obstacleSpawnMs * (1 - spawnReduction));
        if (spawnTimerRef.current >= effectiveSpawn) {
          // 최소 반응 시간 보장: 직전 스폰 이후 일정 시간 이내면 스킵
          if (time - (lastSpawnAtRef.current || 0) < MIN_REACTION_MS) {
            // 다음 프레임에서 다시 시도
            rafRef.current = requestAnimationFrame(step);
            return;
          }
          spawnTimerRef.current = 0;
          lastSpawnAtRef.current = time;
          const obstacleSize = Math.floor(Math.min(width, height) * 0.07); // 화면 크기의 7%
          const pattern = Math.random();
          const obstacleType = Math.random();
          
          // 장애물 타입 결정
          let type = 'default';
          if (obstacleType < 0.25) type = 'spike';
          else if (obstacleType < 0.5) type = 'rock';
          else if (obstacleType < 0.75) type = 'crystal';
          // default는 0.75 이상
          
          const allowDouble = elapsedRef.current >= DOUBLE_SPAWN_GRACE_MS;
          const allowTriple = elapsedRef.current >= TRIPLE_SPAWN_GRACE_MS;
          const allowTall = elapsedRef.current >= TALL_SPAWN_GRACE_MS;
          const allowLong = elapsedRef.current >= LONG_SPAWN_GRACE_MS;
          const allowAntiJump = elapsedRef.current >= ANTIJUMP_SPAWN_GRACE_MS;

          // 후반 가중치(30초 이후 ~ 90초에 걸쳐 0→1)
          const elapsedSec = elapsedRef.current / 1000;
          const lateFactor = Math.max(0, Math.min(1, (elapsedSec - 30) / 60));

          // 현재 배속 기반 가중치(스폰 단계에서 사용)
          const difficultyMultiplierTemp = Math.min(1 + distanceRef.current * difficultyScale, MAX_SPEED_MULTIPLIER);
          const speedFactorTemp = Math.min(1, (difficultyMultiplierTemp - 1) / (MAX_SPEED_MULTIPLIER - 1)); // 0~1

          // 동적 패턴 확률 (합이 너무 커지지 않도록 조정)
          const tripleThreshold = 0.20 + 0.15 * lateFactor;   // 0.20 → 0.35
          const longThreshold = 0.12 + 0.08 * lateFactor;     // 0.12 → 0.20 (누적)
          const antiJumpThreshold = 0.08 + 0.07 * lateFactor; // 0.08 → 0.15 (누적)
          const doubleThreshold = 0.12 + 0.08 * lateFactor;   // 0.12 → 0.20 (누적)

          // 고층 전용 분기(기본 패턴 앞에 배치): 독립 확률로 먼저 검사
          const tallStandaloneChance = Math.min(0.35, 0.12 + 0.18 * lateFactor + 0.15 * speedFactorTemp); // 속도 가중 포함, 최대 35%
          if (allowTall && Math.random() < tallStandaloneChance) {
            let heightMultiplier = 2.2 + Math.random() * 2.8; // 2.2x~5.0x
            const extremeTallChance = Math.min(0.25, 0.10 + 0.15 * lateFactor);
            if (Math.random() < extremeTallChance) {
              heightMultiplier = 4.0 + Math.random() * 3.0; // 4.0x~7.0x
            }
            const widthMultiplier = 0.6 + Math.random() * 0.3;
            const tallHeight = Math.max(20, Math.floor(obstacleSize * heightMultiplier));
            const tallWidth = Math.max(12, Math.floor(obstacleSize * widthMultiplier));
            obstaclesRef.current.push({ 
              x: width + 10, 
              y: baseY - tallHeight, 
              width: tallWidth, 
              height: tallHeight,
              type: type
            });
          } else if (allowTriple && pattern < tripleThreshold + 0.10 * speedFactorTemp) { // 속도 올라갈수록 트리플 약간 가중
            // 트리플 장애물: 2단 점프 활용을 높이는 좁은 간격 패턴
            const sizeA = obstacleSize;
            const sizeB = Math.floor(obstacleSize * (0.85 + Math.random() * 0.2));
            const sizeC = Math.floor(obstacleSize * (0.8 + Math.random() * 0.25));
            const gap1 = Math.floor(width * (0.03 + Math.random() * 0.02)); // 3%~5%
            const gap2 = Math.floor(width * (0.035 + Math.random() * 0.025)); // 3.5%~6%
            const x0 = width + 10;
            obstaclesRef.current.push({ x: x0, y: baseY - sizeA, width: sizeA, height: sizeA, type });
            obstaclesRef.current.push({ x: x0 + sizeA + gap1, y: baseY - sizeB, width: sizeB, height: sizeB, type: type === 'spike' ? 'rock' : 'crystal' });
            obstaclesRef.current.push({ x: x0 + sizeA + gap1 + sizeB + gap2, y: baseY - sizeC, width: sizeC, height: sizeC, type: type === 'crystal' ? 'spike' : 'crystal' });
          } else if (allowLong && pattern < tripleThreshold + longThreshold + 0.08 * speedFactorTemp) { // 속도 가중으로 롱 패턴 약간 증가
            // 초장폭(롱) 장애물: 여러 개의 블록을 연속 배치하여 긴 지형 구성
            const baseH = Math.floor(obstacleSize * (0.9 + Math.random() * 0.6)); // 0.9~1.5x 높이(상향)
            const segmentCount = 4 + Math.floor(Math.min(6, 2 + lateFactor * 6)); // 4~12개 (후반 더 증가)
            const segGap = Math.floor(width * (0.01 + Math.random() * 0.01)); // 1%~2% 간격
            let xCursor = width + 10;
            for (let i = 0; i < segmentCount; i += 1) {
              // 각 세그먼트 높이에 ±10% 변동을 줘서 단조로움 방지
              const hVar = baseH + Math.floor((Math.random() * 0.2 - 0.1) * obstacleSize);
              const segH = Math.max(16, hVar);
              obstaclesRef.current.push({
                x: xCursor,
                y: baseY - segH,
                width: obstacleSize,
                height: segH,
                type
              });
              xCursor += obstacleSize + segGap;
            }
          } else if (allowAntiJump && pattern < tripleThreshold + longThreshold + antiJumpThreshold) {
            // AntiJump: 2단 점프를 남발하면 반드시 충돌하도록 더 높은 위치에 배치
            // 1단 점프 정점과 2단 점프 정점을 근사 계산하여 상단 여백 내에서 높은 밴드에 생성
            const desiredJumpApex = Math.max(height * 0.28, (playerRef.current?.height || 40) * 2.5);
            const jumpVelocityEff = Math.min(baseJumpVelocity, Math.sqrt(2 * gravity * desiredJumpApex));
            const singleApex = (jumpVelocityEff * jumpVelocityEff) / (2 * gravity); // 1단 정점(px)
            const doubleApexApprox = Math.min(singleApex * 1.85, height); // 2단 점프 근사 정점(상한)
            const topMargin = Math.floor(height * 0.05); // 화면 상단 여백
            const barHeight = Math.floor(Math.min(24, Math.max(12, (playerRef.current?.height || 40) * (0.6 + Math.random() * 0.2))));
            // 2단 정점의 80~95% 높이에 밴드 중심을 잡고, 화면 상단을 넘지 않도록 클램프
            const targetApex = doubleApexApprox * (0.80 + Math.random() * 0.15);
            const maxReachable = Math.max(0, groundTop - topMargin - barHeight / 2 - 2);
            const bandCenter = Math.max(topMargin + barHeight / 2 + 2, groundTop - Math.min(targetApex, groundTop - (topMargin + barHeight / 2 + 2)));
            const barY = Math.floor(bandCenter - barHeight / 2);
            const barW = Math.floor(Math.min(width * 0.25, Math.max(obstacleSize, width * (0.10 + Math.random() * 0.10))));
            obstaclesRef.current.push({
              x: width + 10,
              y: Math.max(0, Math.min(barY, maxReachable - barHeight / 2)),
              width: barW,
              height: barHeight,
              type: 'antijump'
            });
          } else if (allowDouble && pattern < tripleThreshold + longThreshold + doubleThreshold) {
            // 더블 장애물 (작은 간격)
            const sizeA = obstacleSize;
            const sizeB = Math.floor(obstacleSize * (0.8 + Math.random() * 0.2));
            const gap = Math.floor(width * (0.035 + Math.random() * 0.025));
            obstaclesRef.current.push({ 
              x: width + 10, 
              y: baseY - sizeA, 
              width: sizeA, 
              height: sizeA,
              type: type
            });
            obstaclesRef.current.push({ 
              x: width + 10 + sizeA + gap, 
              y: baseY - sizeB, 
              width: sizeB, 
              height: sizeB,
              type: type === 'spike' ? 'rock' : 'crystal' // 두 번째는 다른 타입
            });
          } else {
            // 일반 바닥 장애물 (단일 기본 블록)
            obstaclesRef.current.push({ 
              x: width + 10, 
              y: baseY - obstacleSize, 
              width: obstacleSize, 
              height: obstacleSize,
              type: type
            });
          }
        }

        // 이동 및 제거 (난이도 스케일 적용) - 게임 오버 상태에서도 계속 움직임
        // 속도 상한을 둬서 너무 빨라져 오브젝트가 한 프레임에 화면을 건너뛰지 않도록 함
        const difficultyMultiplier = Math.min(1 + distanceRef.current * difficultyScale, MAX_SPEED_MULTIPLIER);
        const currentSpeed = obstacleSpeed * difficultyMultiplier;
        const pxDelta = (currentSpeed * delta) / 1000;
        obstaclesRef.current.forEach((o) => {
          o.x -= pxDelta;
        });
        // 최대 개수 제한 및 화면 밖 제거
        obstaclesRef.current = obstaclesRef.current.filter((o) => o.x + o.width > -20).slice(-40);

        // 충돌 감지 (축소 AABB)
        const getHitbox = (obj, type) => {
          const shrinkX = type === 'player' ? 0.15 : 0.1; // 비율
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

        if (!gameOverRef.current) {
          for (let i = 0; i < obstaclesRef.current.length; i += 1) {
            const o = obstaclesRef.current[i];
            const playerHB = getHitbox(player, 'player');
            const obstacleHB = getHitbox(o, 'obstacle');
            if (aabb(playerHB, obstacleHB)) {
              if (invincibleMsRef.current === 0) {
                livesRef.current = Math.max(0, livesRef.current - 1);
                invincibleMsRef.current = 800; // 0.8초 무적
                // HIT 텍스트 표시
                hitTextRef.current = {
                  show: true,
                  x: player.x + player.width / 2,
                  y: player.y - 20,
                  timer: 1000 // 1초간 표시
                };
                break;
              }
            }
          }
          if (livesRef.current === 0) {
            gameOverRef.current = true;
          }
        }

        // HIT 텍스트 타이머 업데이트
        if (hitTextRef.current.show) {
          hitTextRef.current.timer -= delta;
          if (hitTextRef.current.timer <= 0) {
            hitTextRef.current.show = false;
          }
        }

        // 거리/점수 갱신 (게임오버 아닐 때)
        if (!gameOverRef.current) {
          distanceRef.current += pxDelta;
          scoreRef.current = Math.floor(distanceRef.current * 0.5);
        }

        // 장애물 렌더링
        obstaclesRef.current.forEach((o) => {
          drawObstacle(ctx, o, o.type || 'default');
        });


        
        // HIT 텍스트 렌더링
        if (hitTextRef.current.show) {
          ctx.textAlign = 'center';
          ctx.font = `bold ${tokens.typography.fontSize.xl} ${tokens.typography.fontFamily.sans.join(',')}`;
          ctx.fillStyle = fixedColorsRef.current.error;
          ctx.fillText('HIT!', hitTextRef.current.x, hitTextRef.current.y);
        }

        // 점수 렌더 (우상단 하트 제거)
        const heartY = Math.floor(height * 0.15);
        
        // 점수 표시 (왼쪽 정렬)
        ctx.font = `bold ${tokens.typography.fontSize.lg} ${tokens.typography.fontFamily.sans.join(',')}`;
        ctx.fillStyle = fixedColorsRef.current.textPrimary;
        const formattedHighScore = highScore.toLocaleString();
        const formattedScore = scoreRef.current.toLocaleString();
        
        // High score와 일반 score를 다른 줄에 표시 (왼쪽 정렬)
        const highScoreText = `Best Score: ${formattedHighScore}`;
        const scoreText = `Your Score: ${formattedScore}`;
        
        const leftPad = Math.floor(width * 0.04); // 왼쪽 여백
        
        ctx.textAlign = 'left';
        ctx.fillText(highScoreText, leftPad, heartY - 10);
        ctx.fillText(scoreText, leftPad, heartY + 10);

        // 게임 오버 오버레이
        if (gameOverRef.current) {
          // 게임 상황을 그대로 보여주고 위에 매우 투명한 오버레이만 표시
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(0, 0, width, height);
          
          // 게임 오버 텍스트
          ctx.textAlign = 'center';
          ctx.font = `bold ${tokens.typography.fontSize['4xl']} ${tokens.typography.fontFamily.sans.join(',')}`;
          ctx.fillStyle = fixedColorsRef.current.textPrimary;
          ctx.fillText('Game Over', width / 2, height / 2 - 20);
          
          // 다시 시작 텍스트 (버튼 형태가 아닌 일반 텍스트)
          ctx.font = `bold ${tokens.typography.fontSize.xl} ${tokens.typography.fontFamily.sans.join(',')}`;
          ctx.fillStyle = fixedColorsRef.current.textPrimary;
          ctx.fillText('다시 시작', width / 2, height / 2 + 20);
        }

        // 상위로 상태 보고 (HUD)
        if (typeof onStatus === 'function') {
          onStatus({
            score: scoreRef.current,
            distance: Math.floor(distanceRef.current),
            lives: livesRef.current,
            gameOver: gameOverRef.current,
          });
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = 0;
    };
  }, [loopEnabled, onFrame, width, height, difficultyScale, highScore, obstacleSpawnMs, obstacleSpeed, onStatus, playerColor, spawnAccel]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      className={`game-canvas ${className}`}
      style={{
        display: 'block',
        borderRadius: tokens.borderRadius.lg,
        boxShadow: tokens.shadow.lg,
        // 배경은 캔버스 내부에서 직접 그리므로 DOM 배경은 투명으로 고정
        backgroundColor: 'transparent',
        ...style,
      }}
    />
  );
};

export default GameCanvas;


