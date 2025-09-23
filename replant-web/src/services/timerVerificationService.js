import { supabase, getCurrentUserId, ensureNicknameSession } from '../config/supabase';

class TimerVerificationService {
  /**
   * 타이머 세션 시작
   * @param {string} missionId - 미션 ID
   * @returns {Promise<Object>} 시작된 세션 정보
   */
  async startTimerSession(missionId) {
    try {
      await ensureNicknameSession();
      
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      // 기존 미완료 세션이 있다면 삭제
      await this.cleanupIncompleteSessions(userId, missionId);

      // 새로운 세션 생성
      const { data, error } = await supabase
        .from('timer_sessions')
        .insert({
          user_id: userId,
          mission_id: missionId,
          session_start: new Date().toISOString(),
          completed: false
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('타이머 세션 시작 실패:', error);
      throw error;
    }
  }

  /**
   * 타이머 미션 완료 처리
   * @param {string} missionId - 미션 ID
   * @param {number} durationSeconds - 실제 타이머 시간 (초)
   * @returns {Promise<Object>} 완료된 미션 데이터
   */
  async completeTimerMission(missionId, durationSeconds) {
    try {
      await ensureNicknameSession();
      
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      // 세션 완료 처리
      const { data: sessionData, error: sessionError } = await supabase
        .from('timer_sessions')
        .update({
          session_end: new Date().toISOString(),
          duration_seconds: durationSeconds,
          completed: true
        })
        .eq('user_id', userId)
        .eq('mission_id', missionId)
        .eq('completed', false)
        .select('*')
        .single();

      if (sessionError) {
        throw sessionError;
      }

      // 미션 완료 상태 업데이트
      const { data: missionData, error: missionError } = await supabase
        .from('missions')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('mission_id', missionId)
        .select('*')
        .single();

      if (missionError) {
        throw missionError;
      }

      return {
        session: sessionData,
        mission: missionData
      };
    } catch (error) {
      console.error('타이머 미션 완료 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 타이머 세션 유효성 검사
   * @param {number} durationSeconds - 실제 타이머 시간 (초)
   * @param {number} requiredSeconds - 요구되는 시간 (초, 기본값: 300초 = 5분)
   * @returns {boolean} 유효성 여부
   */
  validateTimerSession(durationSeconds, requiredSeconds = 300) {
    if (!durationSeconds || durationSeconds < 0) {
      return false;
    }

    // 최소 80% 이상 완료해야 유효 (4분 이상)
    const minimumRequired = requiredSeconds * 0.8;
    return durationSeconds >= minimumRequired;
  }

  /**
   * 미완료 세션 정리
   * @param {string} userId - 사용자 ID
   * @param {string} missionId - 미션 ID
   * @returns {Promise<void>}
   */
  async cleanupIncompleteSessions(userId, missionId) {
    try {
      await supabase
        .from('timer_sessions')
        .delete()
        .eq('user_id', userId)
        .eq('mission_id', missionId)
        .eq('completed', false);
    } catch (error) {
      console.error('미완료 세션 정리 실패:', error);
      // 정리 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

  /**
   * 타이머 히스토리 조회
   * @param {string} userId - 사용자 ID
   * @param {number} limit - 조회할 개수
   * @returns {Promise<Array>} 타이머 히스토리
   */
  async getTimerHistory(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('timer_sessions')
        .select('mission_id, session_start, session_end, duration_seconds, completed')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('session_start', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('타이머 히스토리 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 타이머 통계 조회
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 타이머 통계 정보
   */
  async getTimerStats(userId) {
    try {
      const { data, error } = await supabase
        .from('timer_sessions')
        .select('duration_seconds, session_start')
        .eq('user_id', userId)
        .eq('completed', true);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          totalSessions: 0,
          totalTime: 0,
          averageTime: 0,
          longestSession: 0
        };
      }

      const totalSessions = data.length;
      const totalTime = data.reduce((sum, session) => sum + (session.duration_seconds || 0), 0);
      const averageTime = Math.round(totalTime / totalSessions);
      const longestSession = Math.max(...data.map(session => session.duration_seconds || 0));

      return {
        totalSessions,
        totalTime,
        averageTime,
        longestSession
      };
    } catch (error) {
      console.error('타이머 통계 조회 실패:', error);
      throw error;
    }
  }
}

export const timerVerificationService = new TimerVerificationService();
