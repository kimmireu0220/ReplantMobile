import { supabase, getCurrentUserId } from '../config/supabase';
import { getStretchingVideoByMissionId } from '../data/stretchingVideos';

class StretchingService {
  /**
   * 스트레칭 영상 URL 가져오기
   * @param {string} fileName - 파일명
   * @returns {string} 공개 URL
   */
  getStretchingVideoUrl(fileName) {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('stretching-videos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('스트레칭 영상 URL 가져오기 실패:', error);
      throw error;
    }
  }

  /**
   * 미션 ID로 스트레칭 영상 정보 가져오기
   * @param {string} missionId - 미션 ID
   * @returns {Object|null} 스트레칭 영상 정보
   */
  getStretchingVideoByMissionId(missionId) {
    const videoInfo = getStretchingVideoByMissionId(missionId);
    if (!videoInfo) return null;

    return {
      ...videoInfo,
      videoUrl: this.getStretchingVideoUrl(videoInfo.videoFileName)
    };
  }

  /**
   * 스트레칭 미션 완료 처리
   * @param {string} missionId - 미션 ID
   * @param {number} completedDuration - 완료된 시간 (초)
   * @returns {Promise<Object>} 완료 결과
   */
  async completeStretchingMission(missionId, completedDuration) {
    try {
      const videoInfo = this.getStretchingVideoByMissionId(missionId);
      if (!videoInfo) {
        throw new Error('스트레칭 영상을 찾을 수 없습니다.');
      }

      // 사용자 ID 가져오기 (missionService와 동일한 패턴)
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      // 미션 완료 처리 (검증 로직 없이 바로 처리)
      const { data, error } = await supabase
        .from('missions')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('mission_id', missionId)
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      // 스트레칭 완료 정보 로그 기록
      console.log('스트레칭 미션 완료:', {
        missionId,
        completedDuration,
        userId,
        videoInfo: {
          title: videoInfo.title,
          duration: videoInfo.duration
        },
        completedAt: new Date().toISOString()
      });

      return {
        success: true,
        data,
        completedDuration,
        videoInfo,
        completedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('스트레칭 미션 완료 실패:', error);
      throw error;
    }
  }

  /**
   * 스트레칭 영상 목록 조회
   * @returns {Promise<Array>} 영상 목록
   */
  async listStretchingVideos() {
    try {
      const { data, error } = await supabase.storage
        .from('stretching-videos')
        .list('', {
          limit: 100,
          offset: 0
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('스트레칭 영상 목록 조회 실패:', error);
      throw error;
    }
  }
}

export const stretchingService = new StretchingService();
