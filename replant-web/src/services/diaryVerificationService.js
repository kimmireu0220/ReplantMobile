import { supabase, getCurrentUserId, ensureNicknameSession } from '../config/supabase';

class DiaryVerificationService {
  /**
   * 일기 작성 완료 확인
   * @param {string} missionId - 미션 ID
   * @returns {Promise<boolean>} 일기 작성 완료 여부
   */
  async checkDiaryCompletion(missionId) {
    try {
      await ensureNicknameSession();
      
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      // 오늘 날짜 구하기
      const today = new Date().toISOString().split('T')[0];
      
      // 오늘 날짜의 일기 데이터 조회
      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error) {
        // 일기가 없는 경우
        if (error.code === 'PGRST116') {
          return false;
        }
        throw error;
      }

      // 일기 데이터 유효성 검사
      return this.validateDiaryData(data);
    } catch (error) {
      console.error('일기 완료 확인 실패:', error);
      throw error;
    }
  }

  /**
   * 미션 완료 처리
   * @param {string} missionId - 미션 ID
   * @returns {Promise<Object>} 완료된 미션 데이터
   */
  async completeDiaryMission(missionId) {
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
      console.error('미션 완료 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 일기 데이터 검증
   * @param {Object} diaryData - 일기 데이터
   * @returns {boolean} 유효성 여부
   */
  validateDiaryData(diaryData) {
    if (!diaryData) {
      return false;
    }

    // 필수 필드 확인
    const hasContent = diaryData.content && diaryData.content.trim().length > 0;
    const hasEmotion = diaryData.emotion_id && diaryData.emotion_id.trim().length > 0;

    // 최소 내용 길이 확인 (10자 이상)
    const contentLength = diaryData.content ? diaryData.content.trim().length : 0;
    const hasMinimumContent = contentLength >= 10;

    return hasContent && hasEmotion && hasMinimumContent;
  }

  /**
   * 일기 작성 상태 조회
   * @param {string} userId - 사용자 ID
   * @param {string} date - 날짜 (YYYY-MM-DD)
   * @returns {Promise<Object>} 일기 상태 정보
   */
  async getDiaryStatus(userId, date) {
    try {
      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { exists: false, data: null };
        }
        throw error;
      }

      return {
        exists: true,
        data: data,
        isValid: this.validateDiaryData(data)
      };
    } catch (error) {
      console.error('일기 상태 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 최근 일기 작성 이력 조회
   * @param {string} userId - 사용자 ID
   * @param {number} limit - 조회할 개수
   * @returns {Promise<Array>} 일기 작성 이력
   */
  async getRecentDiaryHistory(userId, limit = 7) {
    try {
      const { data, error } = await supabase
        .from('diaries')
        .select('date, emotion_id, content')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('일기 이력 조회 실패:', error);
      throw error;
    }
  }
}

export const diaryVerificationService = new DiaryVerificationService();
