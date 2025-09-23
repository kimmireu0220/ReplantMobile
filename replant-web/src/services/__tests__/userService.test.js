import { userService } from '../userService';
import { 
  supabase, 
  getCurrentUserId, 
  getCurrentUserNickname, 
  setNicknameInSession, 
  validateNickname 
} from '../../config/supabase';
import { logger } from '../../utils/logger';

// Mock dependencies
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      }))
    })),
    rpc: jest.fn(() => ({
      data: null,
      error: null
    }))
  },
  getCurrentUserId: jest.fn(),
  getCurrentUserNickname: jest.fn(),
  setNicknameInSession: jest.fn(),
  validateNickname: jest.fn()
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn()
  }
}));

// Mock localStorage
const mockLocalStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('UserService', () => {
  let mockSelect, mockEq, mockSingle, mockUpdate, mockRpc;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup common mocks
    mockSelect = jest.fn();
    mockEq = jest.fn();
    mockSingle = jest.fn();
    mockUpdate = jest.fn();
    mockRpc = jest.fn();

    // Reset supabase mock structure
    supabase.from.mockReturnValue({
      select: mockSelect,
      update: mockUpdate
    });
    supabase.rpc = mockRpc;
    
    getCurrentUserId.mockResolvedValue('test-user-id');
    getCurrentUserNickname.mockReturnValue('current-nickname');
    setNicknameInSession.mockResolvedValue();
    validateNickname.mockReturnValue({ isValid: true, message: '' });
  });

  describe('updateUserNickname', () => {
    const newNickname = 'new-nickname';

    it('should update nickname successfully', async () => {
      const mockResult = {
        success: true,
        data: {
          old_nickname: 'current-nickname',
          new_nickname: newNickname,
          user_id: 'test-user-id'
        }
      };

      mockRpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      const result = await userService.updateUserNickname(newNickname);

      expect(validateNickname).toHaveBeenCalledWith(newNickname);
      expect(getCurrentUserNickname).toHaveBeenCalled();
      expect(setNicknameInSession).toHaveBeenCalledWith('current-nickname');
      expect(mockRpc).toHaveBeenCalledWith('update_user_nickname_safe', {
        current_nickname: 'current-nickname',
        new_nickname: newNickname
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('userNickname', newNickname);
      expect(setNicknameInSession).toHaveBeenCalledWith(newNickname);
      
      expect(result).toEqual({
        success: true,
        data: {
          oldNickname: 'current-nickname',
          newNickname: newNickname,
          userId: 'test-user-id'
        }
      });
    });

    it('should return error for invalid nickname', async () => {
      validateNickname.mockReturnValue({
        isValid: false,
        message: '닉네임이 유효하지 않습니다.'
      });

      const result = await userService.updateUserNickname('');

      expect(result).toEqual({
        success: false,
        error: '닉네임이 유효하지 않습니다.'
      });
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it('should return error when current nickname not found', async () => {
      getCurrentUserNickname.mockReturnValue(null);

      const result = await userService.updateUserNickname(newNickname);

      expect(result).toEqual({
        success: false,
        error: '현재 닉네임을 찾을 수 없습니다.'
      });
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it('should return error when new nickname is same as current', async () => {
      getCurrentUserNickname.mockReturnValue(newNickname);

      const result = await userService.updateUserNickname(newNickname);

      expect(result).toEqual({
        success: false,
        error: '현재 닉네임과 동일합니다.'
      });
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it('should handle RPC error', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' }
      });

      const result = await userService.updateUserNickname(newNickname);

      expect(logger.error).toHaveBeenCalledWith('닉네임 변경 RPC 오류:', { message: 'RPC failed' });
      expect(result).toEqual({
        success: false,
        error: '닉네임 변경 중 오류가 발생했습니다.'
      });
    });

    it('should handle RPC result with success false', async () => {
      mockRpc.mockResolvedValue({
        data: {
          success: false,
          error: '닉네임이 이미 사용 중입니다.'
        },
        error: null
      });

      const result = await userService.updateUserNickname(newNickname);

      expect(result).toEqual({
        success: false,
        error: '닉네임이 이미 사용 중입니다.'
      });
    });

    it('should handle localStorage failure gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('LocalStorage error');
      });

      const mockResult = {
        success: true,
        data: {
          old_nickname: 'current-nickname',
          new_nickname: newNickname,
          user_id: 'test-user-id'
        }
      };

      mockRpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      const result = await userService.updateUserNickname(newNickname);

      expect(logger.warn).toHaveBeenCalledWith('localStorage 업데이트 실패:', expect.any(Error));
      expect(result.success).toBe(true); // Should still succeed
    });

    it('should handle setNicknameInSession failure gracefully', async () => {
      setNicknameInSession.mockImplementation((nickname) => {
        if (nickname === newNickname) {
          throw new Error('Session error');
        }
        return Promise.resolve();
      });

      const mockResult = {
        success: true,
        data: {
          old_nickname: 'current-nickname',
          new_nickname: newNickname,
          user_id: 'test-user-id'
        }
      };

      mockRpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      const result = await userService.updateUserNickname(newNickname);

      expect(logger.warn).toHaveBeenCalledWith('세션 업데이트 실패:', expect.any(Error));
      expect(result.success).toBe(true); // Should still succeed
    });

    it('should handle general exception', async () => {
      validateNickname.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await userService.updateUserNickname(newNickname);

      expect(logger.error).toHaveBeenCalledWith('닉네임 변경 중 예외:', expect.any(Error));
      expect(result).toEqual({
        success: false,
        error: '닉네임 변경 중 오류가 발생했습니다.'
      });
    });
  });

  describe('getCurrentUser', () => {
    const mockUser = {
      id: 'test-user-id',
      nickname: 'test-user',
      email: 'test@example.com'
    };

    it('should get current user successfully', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockReturnValue({
            data: mockUser,
            error: null
          })
        })
      });

      const result = await userService.getCurrentUser();

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', 'test-user-id');
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: mockUser
      });
    });

    it('should return error when user ID not found', async () => {
      getCurrentUserId.mockResolvedValue(null);

      const result = await userService.getCurrentUser();

      expect(result).toEqual({
        success: false,
        error: '사용자 정보를 찾을 수 없습니다.'
      });
    });

    it('should handle database error', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockReturnValue({
            data: null,
            error: { message: 'User not found' }
          })
        })
      });

      const result = await userService.getCurrentUser();

      expect(result).toEqual({
        success: false,
        error: '사용자 정보를 가져올 수 없습니다.'
      });
    });

    it('should handle exception', async () => {
      getCurrentUserId.mockRejectedValue(new Error('Unexpected error'));

      const result = await userService.getCurrentUser();

      expect(result).toEqual({
        success: false,
        error: '사용자 정보 조회 중 오류가 발생했습니다.'
      });
    });
  });

  describe('updateUserSettings', () => {
    const mockSettings = {
      theme: 'dark',
      notifications: true
    };
    const mockUpdatedUser = {
      id: 'test-user-id',
      settings: mockSettings
    };

    it('should update user settings successfully', async () => {
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockReturnValue({
              data: mockUpdatedUser,
              error: null
            })
          })
        })
      });

      const result = await userService.updateUserSettings(mockSettings);

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockUpdate).toHaveBeenCalledWith({
        settings: mockSettings,
        updated_at: expect.any(String)
      });
      expect(mockEq).toHaveBeenCalledWith('id', 'test-user-id');
      expect(result).toEqual({
        success: true,
        data: mockUpdatedUser
      });
    });

    it('should return error when user ID not found', async () => {
      getCurrentUserId.mockResolvedValue(null);

      const result = await userService.updateUserSettings(mockSettings);

      expect(result).toEqual({
        success: false,
        error: '사용자 정보를 찾을 수 없습니다.'
      });
    });

    it('should handle database error', async () => {
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockReturnValue({
              data: null,
              error: { message: 'Update failed' }
            })
          })
        })
      });

      const result = await userService.updateUserSettings(mockSettings);

      expect(result).toEqual({
        success: false,
        error: '설정 업데이트에 실패했습니다.'
      });
    });

    it('should handle exception', async () => {
      getCurrentUserId.mockRejectedValue(new Error('Unexpected error'));

      const result = await userService.updateUserSettings(mockSettings);

      expect(result).toEqual({
        success: false,
        error: '설정 업데이트 중 오류가 발생했습니다.'
      });
    });
  });

  describe('updateLastActiveTime', () => {
    const mockUpdatedUser = {
      id: 'test-user-id',
      last_active_at: expect.any(String),
      updated_at: expect.any(String)
    };

    it('should update last active time successfully', async () => {
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockReturnValue({
              data: mockUpdatedUser,
              error: null
            })
          })
        })
      });

      const result = await userService.updateLastActiveTime();

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockUpdate).toHaveBeenCalledWith({
        last_active_at: expect.any(String),
        updated_at: expect.any(String)
      });
      expect(result).toEqual({
        success: true,
        data: mockUpdatedUser
      });
    });

    it('should return success when user ID not found (not logged in)', async () => {
      getCurrentUserId.mockResolvedValue(null);

      const result = await userService.updateLastActiveTime();

      expect(result).toEqual({
        success: true,
        data: null
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockReturnValue({
              data: null,
              error: { message: 'Update failed' }
            })
          })
        })
      });

      const result = await userService.updateLastActiveTime();

      expect(result).toEqual({
        success: false,
        error: '활동 시간 업데이트에 실패했습니다.'
      });
    });

    it('should handle exception', async () => {
      getCurrentUserId.mockRejectedValue(new Error('Unexpected error'));

      const result = await userService.updateLastActiveTime();

      expect(result).toEqual({
        success: false,
        error: '활동 시간 업데이트 중 오류가 발생했습니다.'
      });
    });
  });
});