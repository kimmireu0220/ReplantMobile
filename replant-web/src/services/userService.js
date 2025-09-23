import { supabase, getCurrentUserId, getCurrentUserNickname, setNicknameInSession, validateNickname } from '../config/supabase';
import { logger } from '../utils/logger';

/**
 * 사용자 관련 서비스 함수들
 */

/**
 * 현재 사용자의 닉네임을 변경합니다
 * @param {string} newNickname - 새로운 닉네임
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
const updateUserNickname = async (newNickname) => {
  try {
    // 1. 기본 유효성 검증
    const validation = validateNickname(newNickname);
    if (!validation.isValid) {
      return { success: false, error: validation.message };
    }

    // 2. 현재 닉네임 확인
    const currentNickname = getCurrentUserNickname();
    if (!currentNickname) {
      return { success: false, error: '현재 닉네임을 찾을 수 없습니다.' };
    }

    if (currentNickname === newNickname) {
      return { success: false, error: '현재 닉네임과 동일합니다.' };
    }

    // 3. RPC 호출 전 세션 GUC 보장 후 안전한 닉네임 변경
    try {
      // 변경 전 닉네임으로 세션 고정
      await setNicknameInSession(currentNickname);
    } catch (_) {}
    const { data, error } = await supabase.rpc('update_user_nickname_safe', {
      current_nickname: currentNickname,
      new_nickname: newNickname
    });

    if (error) {
      logger.error('닉네임 변경 RPC 오류:', error);
      return { success: false, error: '닉네임 변경 중 오류가 발생했습니다.' };
    }

    // 4. 결과 파싱
    const result = data;
    if (!result.success) {
      return { success: false, error: result.error || '닉네임 변경에 실패했습니다.' };
    }

    // 5. 성공 시 로컬 스토리지와 세션 갱신
    try {
      localStorage.setItem('userNickname', newNickname);
    } catch (e) {
      logger.warn('localStorage 업데이트 실패:', e);
    }

    try {
      await setNicknameInSession(newNickname);
    } catch (e) {
      logger.warn('세션 업데이트 실패:', e);
    }

    return {
      success: true,
      data: {
        oldNickname: result.data.old_nickname,
        newNickname: result.data.new_nickname,
        userId: result.data.user_id
      }
    };

  } catch (error) {
    logger.error('닉네임 변경 중 예외:', error);
    return { success: false, error: '닉네임 변경 중 오류가 발생했습니다.' };
  }
};

/**
 * 현재 사용자 정보를 가져옵니다
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
const getCurrentUser = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { success: false, error: '사용자 정보를 가져올 수 없습니다.' };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: '사용자 정보 조회 중 오류가 발생했습니다.' };
  }
};

/**
 * 사용자 설정을 업데이트합니다
 * @param {Object} settings - 업데이트할 설정 객체
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
const updateUserSettings = async (settings) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        settings: settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      return { success: false, error: '설정 업데이트에 실패했습니다.' };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: '설정 업데이트 중 오류가 발생했습니다.' };
  }
};

/**
 * 사용자의 마지막 활동 시간을 업데이트합니다
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
const updateLastActiveTime = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: true, data: null }; // 로그인하지 않은 경우 성공으로 처리
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      return { success: false, error: '활동 시간 업데이트에 실패했습니다.' };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: '활동 시간 업데이트 중 오류가 발생했습니다.' };
  }
};

export const userService = {
  updateUserNickname,
  getCurrentUser,
  updateUserSettings,
  updateLastActiveTime
};