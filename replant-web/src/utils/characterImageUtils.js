import { StorageService } from '../services/storageService';

// 감정별 이미지 매핑
const EMOTION_MAPPING = {
  default: 'default',
  happy: 'happy',
  waving: 'waving'
};

// 레벨별 이미지 URL 생성
export const getCharacterImageUrl = (level, emotion = 'default') => {
  const emotionKey = EMOTION_MAPPING[emotion] || 'default';
  const path = `level${level}/${emotionKey}.png`;
  return StorageService.getImageUrl(path);
};

// 캐릭터 이미지들 프리로딩
export const preloadCharacterImages = async (levels = [1, 2, 3, 4, 5, 6]) => {
  const emotions = ['default', 'happy', 'waving'];
  const promises = [];
  
  levels.forEach(level => {
    emotions.forEach(emotion => {
      const url = getCharacterImageUrl(level, emotion);
      promises.push(StorageService.preloadImage(url));
    });
  });
  
  try {
    await Promise.all(promises);
  } catch (error) {
    // Preloading failure is non-critical
  }
};

// 캐릭터별 기본 이모지 매핑
export const getCharacterEmoji = (level, category) => {
  const levelEmojis = {
    1: '🌱', // 씨앗
    2: '🌿', // 새싹
    3: '🌳', // 어린 식물
    4: '🌲', // 나무
    5: '🌳', // 열매 나무
    6: '🌳'  // 성숙한 나무
  };
  
  const categoryEmojis = {
    'exercise': '💪',
    'cleaning': '🧹',
    'reading': '📚',
    'selfcare': '🌸',
    'social': '👥',
    'creativity': '🎨'
  };
  
  return categoryEmojis[category] || levelEmojis[level] || '🌱';
}; 