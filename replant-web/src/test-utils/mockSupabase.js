/**
 * 공통 Supabase 모킹 유틸리티
 * 모든 서비스 테스트에서 재사용 가능한 모킹 패턴 제공
 */

export const createMockSupabaseClient = () => {
  const mockSelect = jest.fn();
  const mockOrder = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();
  const mockUpdate = jest.fn();
  const mockUpsert = jest.fn();
  const mockInsert = jest.fn();
  const mockDelete = jest.fn();
  const mockRpc = jest.fn();

  const supabaseMock = {
    from: jest.fn(() => ({
      select: mockSelect,
      update: mockUpdate,
      upsert: mockUpsert,
      insert: mockInsert,
      delete: mockDelete
    })),
    rpc: mockRpc
  };

  return {
    supabase: supabaseMock,
    mocks: {
      select: mockSelect,
      order: mockOrder,
      eq: mockEq,
      single: mockSingle,
      update: mockUpdate,
      upsert: mockUpsert,
      insert: mockInsert,
      delete: mockDelete,
      rpc: mockRpc
    }
  };
};

export const createSuccessResponse = (data) => ({
  data,
  error: null
});

export const createErrorResponse = (message = 'Database error', code = null) => ({
  data: null,
  error: { message, code }
});

// 체이닝 가능한 쿼리 빌더 모킹 헬퍼
export const createQueryBuilderMock = (finalResponse) => {
  const chainMock = {
    select: jest.fn(() => chainMock),
    eq: jest.fn(() => chainMock),
    order: jest.fn(() => chainMock),
    single: jest.fn(() => finalResponse),
    ...finalResponse
  };
  return chainMock;
};

// 일반적인 테스트 데이터
export const mockTestData = {
  user: {
    id: 'test-user-id',
    nickname: 'testuser',
    settings: {
      selectedCharacterId: 'exercise'
    }
  },
  character: {
    id: 'exercise',
    category_id: 'exercise',
    name: '운동 캐릭터',
    level: 5,
    experience: 100,
    total_experience: 500,
    unlocked: true,
    stats: {
      missionsCompleted: 10,
      daysActive: 5,
      streak: 3,
      longestStreak: 7
    }
  },
  mission: {
    id: 1,
    title: '산책하기',
    description: '30분 산책',
    category_id: 'exercise',
    difficulty: 'easy',
    experience_reward: 20,
    completed: false
  },
  gameResult: {
    id: 1,
    user_id: 'test-user-id',
    game_type: 'memory',
    score: 850,
    duration: 120,
    difficulty: 'normal',
    completed_at: new Date().toISOString()
  }
};