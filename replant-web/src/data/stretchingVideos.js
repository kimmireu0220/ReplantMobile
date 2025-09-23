/**
 * 스트레칭 영상 데이터
 * 미션별 스트레칭 영상 정보를 관리
 */

export const stretchingVideos = {
  'ex1': {
    id: 'ex1',
    title: '전신 스트레칭',
    description: '간단한 전신 스트레칭으로 몸을 풀어보세요',
    videoFileName: 'stretching-full-body-5min.mp4',
    duration: 20, // 실제 영상 길이: 20초
    difficulty: 'easy',
    targetMuscles: ['목', '어깨', '허리', '다리'],
    instructions: [
      '편안한 자세로 시작하세요',
      '영상과 함께 천천히 따라해주세요',
      '스트레칭을 꾸준히 유지해주세요',
      '통증이 있으면 즉시 중단하세요'
    ]
  },
  'ex10': {
    id: 'ex10',
    title: 'HIIT 전신 루틴',
    description: '짧고 강한 HIIT 동작을 따라하며 전신을 활성화하세요',
    videoFileName: 'hiit-5min.mp4',
    duration: 20,
    difficulty: 'medium',
    targetMuscles: ['전신'],
    instructions: [
      '충분히 공간을 확보하세요',
      '무리하지 말고 본인 페이스로 진행하세요',
      '호흡을 규칙적으로 유지하세요',
      '어지러움이 있으면 즉시 중단하세요'
    ]
  }
};

/**
 * 스트레칭 영상 URL 생성
 * @param {string} fileName - 파일명
 * @returns {string} Supabase Storage URL
 */
export const getStretchingVideoUrl = (fileName) => {
  // 실제 Supabase Storage URL
  return `https://lhnkpabpnyifwiaqwyvy.supabase.co/storage/v1/object/public/stretching-videos/${fileName}`;
};

/**
 * 미션 ID로 스트레칭 영상 정보 가져오기
 * @param {string} missionId - 미션 ID
 * @returns {Object|null} 스트레칭 영상 정보
 */
export const getStretchingVideoByMissionId = (missionId) => {
  return stretchingVideos[missionId] || null;
};

/**
 * 모든 스트레칭 영상 목록 가져오기
 * @returns {Array} 스트레칭 영상 목록
 */
export const getAllStretchingVideos = () => {
  return Object.values(stretchingVideos);
};
