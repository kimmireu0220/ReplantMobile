import { supabase } from '../config/supabase';
import { validateVideoFile, normalizeVideoFileName } from '../utils/videoUtils';

class VideoService {
  /**
   * 영상 파일 업로드
   * @param {File} file - 업로드할 영상 파일
   * @param {string} missionId - 미션 ID
   * @returns {Promise<Object>} 업로드 결과
   */
  async uploadVideo(file, missionId) {
    try {
      // 기존 PhotoSubmitButton과 동일한 검증 패턴
      const validation = validateVideoFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // 파일명 생성 (기존 패턴과 일치)
      const fileName = normalizeVideoFileName(file.name, missionId);
      
      // Supabase Storage에 업로드 (기존 패턴과 일치)
      const { error } = await supabase.storage
        .from('mission-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // 공개 URL 생성 (기존 패턴과 일치)
      const { data: { publicUrl } } = supabase.storage
        .from('mission-videos')
        .getPublicUrl(fileName);

      return { 
        success: true, 
        url: publicUrl, 
        fileName,
        fileSize: file.size,
        fileType: file.type
      };
    } catch (error) {
      console.error('영상 업로드 실패:', error);
      throw error;
    }
  }

  /**
   * 영상 파일 삭제
   * @param {string} fileName - 삭제할 파일명
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteVideo(fileName) {
    try {
      const { error } = await supabase.storage
        .from('mission-videos')
        .remove([fileName]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('영상 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 영상 파일 URL 가져오기
   * @param {string} fileName - 파일명
   * @returns {string} 공개 URL
   */
  getVideoUrl(fileName) {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('mission-videos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('영상 URL 가져오기 실패:', error);
      throw error;
    }
  }

  /**
   * 영상 파일 목록 조회
   * @param {string} missionId - 미션 ID (선택사항)
   * @returns {Promise<Array>} 파일 목록
   */
  async listVideos(missionId = null) {
    try {
      let query = supabase.storage
        .from('mission-videos')
        .list('', {
          limit: 100,
          offset: 0
        });

      const { data, error } = await query;

      if (error) throw error;

      // 미션 ID로 필터링 (선택사항)
      if (missionId) {
        return data.filter(file => file.name.includes(`mission-${missionId}`));
      }

      return data || [];
    } catch (error) {
      console.error('영상 목록 조회 실패:', error);
      throw error;
    }
  }
}

export const videoService = new VideoService();
