import { supabase, getCurrentUserId, ensureNicknameSession } from '../config/supabase';

class AudioVerificationService {
  /**
   * 음악 듣기 세션 시작
   * @returns {Promise<Object>} 세션 정보
   */
  async startAudioSession() {
    try {
      await ensureNicknameSession();
      
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      // 세션 시작 로그 (선택사항)
      console.log(`Audio session started for user: ${userId}`);
      
      return {
        success: true,
        message: '음악 듣기 세션이 시작되었습니다.',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('음악 듣기 세션 시작 실패:', error);
      throw error;
    }
  }

  /**
   * 미션 완료 처리
   * @param {string} missionId - 미션 ID
   * @returns {Promise<Object>} 완료된 미션 데이터
   */
  async completeAudioMission(missionId) {
    try {
      await ensureNicknameSession();
      
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      // 미션 완료 상태 업데이트
      const { data, error } = await supabase
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

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('음악 듣기 미션 완료 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 음악 듣기 세션 검증
   * @param {number} listenTime - 듣기 시간 (초)
   * @param {number} requiredTime - 필요 시간 (초, 기본값: 300초)
   * @returns {boolean} 검증 결과
   */
  validateAudioSession(listenTime, requiredTime = 300) {
    if (!listenTime || listenTime < 0) {
      return false;
    }

    // 최소 듣기 시간 확인 (5분 = 300초)
    return listenTime >= requiredTime;
  }

  /**
   * 음악 듣기 이력 조회
   * @param {string} userId - 사용자 ID
   * @param {number} limit - 조회할 개수
   * @returns {Promise<Array>} 음악 듣기 이력
   */
  async getAudioHistory(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('mission_id, completed_at, created_at')
        .eq('user_id', userId)
        .eq('mission_id', 'cr1') // cr1은 음악 듣기 미션
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('음악 듣기 이력 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 음악 듣기 통계 조회
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 통계 정보
   */
  async getAudioStats(userId) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('completed_at')
        .eq('user_id', userId)
        .eq('mission_id', 'cr1')
        .eq('completed', true);

      if (error) {
        throw error;
      }

      const completedCount = data?.length || 0;
      const lastCompleted = data?.[0]?.completed_at || null;

      return {
        totalCompleted: completedCount,
        lastCompleted: lastCompleted,
        averagePerWeek: this.calculateAveragePerWeek(data)
      };
    } catch (error) {
      console.error('음악 듣기 통계 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 주간 평균 계산
   * @param {Array} completedData - 완료 데이터
   * @returns {number} 주간 평균
   */
  calculateAveragePerWeek(completedData) {
    if (!completedData || completedData.length === 0) {
      return 0;
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    const recentCompletions = completedData.filter(item => {
      const completedAt = new Date(item.completed_at);
      return completedAt >= oneWeekAgo;
    });

    return recentCompletions.length;
  }

  /**
   * 음악 듣기 권장사항 생성
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 권장사항
   */
  async getAudioRecommendations(userId) {
    try {
      const stats = await this.getAudioStats(userId);
      
      let recommendation = {
        message: '음악 듣기를 시작해보세요!',
        type: 'encouragement'
      };

      if (stats.totalCompleted === 0) {
        recommendation = {
          message: '처음 음악 듣기 미션을 완료해보세요!',
          type: 'first_time'
        };
      } else if (stats.averagePerWeek < 2) {
        recommendation = {
          message: '주 2회 이상 음악 듣기를 권장합니다.',
          type: 'increase_frequency'
        };
      } else if (stats.averagePerWeek >= 3) {
        recommendation = {
          message: '훌륭합니다! 꾸준히 음악을 듣고 계시네요.',
          type: 'excellent'
        };
      }

      return recommendation;
    } catch (error) {
      console.error('음악 듣기 권장사항 생성 실패:', error);
      throw error;
    }
  }
}

export const audioVerificationService = new AudioVerificationService();
