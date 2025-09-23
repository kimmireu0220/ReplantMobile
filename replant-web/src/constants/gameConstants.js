/**
 * 게임 물리 및 설정 상수
 * GameCanvas.jsx에서 분리
 */

// 물리 상수
export const PHYSICS = {
  GRAVITY: 5000, // px/s^2
  BASE_JUMP_VELOCITY: 1300, // px/s
  COYOTE_TIME_MS: 120, // 지면 이탈 후 점프 유예 시간
  JUMP_BUFFER_MS: 120, // 점프 입력 버퍼 시간
  MAX_JUMP_COUNT: 2 // 2단 점프 지원
};

// 난이도 설정
export const DIFFICULTY = {
  SCALE: 0.0005, // 거리(px)당 속도 증가율
  SPAWN_ACCEL: 0.0002, // 거리(px)당 스폰 간격 감소율
  MAX_SPEED_MULTIPLIER: 10.0, // 기본 속도의 최대 배수 제한
  MIN_SPAWN_MS: 800, // 스폰 간격의 하한
  MAX_SPAWN_REDUCTION: 0.5, // 스폰 간격 감소의 최대 비율
  MIN_REACTION_MS: 380 // 연속 스폰 사이 최소 반응 시간
};

// 장애물 설정
export const OBSTACLES = {
  DEFAULT_SPAWN_MS: 1800, // 기본 스폰 간격
  DEFAULT_SPEED: 260, // 기본 이동 속도
  MAX_COUNT: 40, // 최대 장애물 개수
  
  // 그레이스 타임 (초기 난이도 완화)
  GRACE_TIMES: {
    DOUBLE_SPAWN: 6000, // 더블 장애물 금지
    TRIPLE_SPAWN: 12000, // 트리플 장애물 금지
    TALL_SPAWN: 5000, // 초고층 장애물 금지
    LONG_SPAWN: 15000, // 초장폭 장애물 금지
    ANTIJUMP_SPAWN: 8000 // AntiJump 금지
  }
};

// 플레이어 설정
export const PLAYER = {
  INITIAL_X: 80,
  WIDTH: 48,
  HEIGHT: 48,
  INVINCIBLE_MS: 800, // 피격 후 무적 시간
  HITBOX_SHRINK: 0.15 // 히트박스 축소 비율
};

// UI 설정
export const UI = {
  HIT_TEXT_DURATION: 1000, // HIT 텍스트 표시 시간
  HEART_Y_RATIO: 0.15, // 하트 위치 (화면 높이 비율)
  LEFT_PAD_RATIO: 0.04, // 왼쪽 여백 비율
  RIGHT_PAD_RATIO: 0.04 // 오른쪽 여백 비율
};

// 장애물 타입별 설정
export const OBSTACLE_TYPES = {
  DEFAULT: 'default',
  SPIKE: 'spike',
  ROCK: 'rock',
  CRYSTAL: 'crystal',
  ANTIJUMP: 'antijump'
};

// 장애물 스폰 확률 (후반 가중치 적용)
export const SPAWN_PROBABILITIES = {
  BASE: {
    TRIPLE_THRESHOLD: 0.20,
    LONG_THRESHOLD: 0.12,
    ANTIJUMP_THRESHOLD: 0.08,
    DOUBLE_THRESHOLD: 0.12
  },
  LATE_FACTOR: {
    TRIPLE_INCREASE: 0.15,
    LONG_INCREASE: 0.08,
    ANTIJUMP_INCREASE: 0.07,
    DOUBLE_INCREASE: 0.08
  },
  TALL_STANDALONE_BASE: 0.12,
  TALL_STANDALONE_INCREASE: 0.18,
  MAX_TALL_CHANCE: 0.35
};

// 색상 상수 (토큰 대신 하드코딩된 값들)
export const COLORS = {
  CLOUD: 'rgba(200, 200, 255, 0.8)',
  OBSTACLES: {
    DEFAULT_START: '#FF6B6B',
    DEFAULT_END: '#C44569',
    DEFAULT_HIGHLIGHT: '#FF8E8E',
    SPIKE: '#8B4513',
    SPIKE_DETAIL: '#654321',
    ROCK: '#696969',
    ROCK_HIGHLIGHT: '#A9A9A9',
    CRYSTAL: '#FF69B4',
    CRYSTAL_HIGHLIGHT: '#FFB6C1',
    ANTIJUMP_START: '#FF6B6B',
    ANTIJUMP_END: '#C44569',
    ANTIJUMP_HIGHLIGHT: '#FF8E8E'
  }
};