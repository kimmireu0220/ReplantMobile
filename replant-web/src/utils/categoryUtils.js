import { tokens } from '../design/tokens';

// 카테고리 유효성 검사 및 정규화
export const validateAndNormalizeCategory = (categoryId, context = '카테고리') => {
  if (!categoryId) {
    throw new Error(`${context} ID가 제공되지 않았습니다.`);
  }

  const normalizedCategory = String(categoryId).toLowerCase().trim();
  
  if (!normalizedCategory) {
    throw new Error(`${context} ID가 비어있습니다.`);
  }

  return normalizedCategory;
};

// 카테고리 색상 가져오기 (기본값 제공)
export const getCategoryColor = (categoryId) => {
  if (!categoryId) return tokens.colors.gray[500];
  
  // 기본 카테고리 색상 매핑
  const categoryColors = {
    exercise: tokens.colors.accent.red,
    cleaning: tokens.colors.accent.green,
    reading: tokens.colors.accent.blue,
    selfcare: tokens.colors.accent.purple,
    social: tokens.colors.accent.orange,
    creativity: tokens.colors.accent.pink
  };
  
  return categoryColors[categoryId] || tokens.colors.gray[500];
};

// 카테고리 이모지 가져오기 (기본값 제공)
export const getCategoryEmoji = (categoryId) => {
  if (!categoryId) return '❓';
  
  // 기본 카테고리 이모지 매핑
  const categoryEmojis = {
    exercise: '💪',
    cleaning: '🧹',
    reading: '📚',
    selfcare: '🌸',
    social: '👥',
    creativity: '🎨'
  };
  
  return categoryEmojis[categoryId] || '❓';
};

// 카테고리 이름 가져오기 (기본값 제공)
export const getCategoryName = (categoryId) => {
  if (!categoryId) return '알 수 없는 카테고리';
  
  // 기본 카테고리 이름 매핑
  const categoryNames = {
    exercise: '운동',
    cleaning: '청소',
    reading: '독서',
    selfcare: '자기돌봄',
    social: '사회활동',
    creativity: '창의활동'
  };
  
  return categoryNames[categoryId] || '알 수 없는 카테고리';
};

// 카테고리 설명 가져오기 (기본값 제공)
export const getCategoryDescription = (categoryId) => {
  if (!categoryId) return '카테고리 정보를 찾을 수 없습니다.';
  
  // 기본 카테고리 설명 매핑
  const categoryDescriptions = {
    exercise: '건강한 몸과 마음을 위한 운동 활동',
    cleaning: '깨끗하고 정돈된 환경 만들기',
    reading: '지식과 상상력을 넓히는 독서 활동',
    selfcare: '자신을 돌보고 사랑하는 활동',
    social: '다른 사람들과의 소통과 연결',
    creativity: '창의성과 표현력을 기르는 활동'
  };
  
  return categoryDescriptions[categoryId] || '카테고리 정보를 찾을 수 없습니다.';
};

// 카테고리 정보 객체 생성
export const getCategoryInfo = (categoryId) => {
  return {
    id: categoryId,
    name: getCategoryName(categoryId),
    emoji: getCategoryEmoji(categoryId),
    color: getCategoryColor(categoryId),
    description: getCategoryDescription(categoryId)
  };
};

// 모든 카테고리 목록 가져오기
export const getAllCategories = () => {
  return [
    'exercise',
    'cleaning', 
    'reading',
    'selfcare',
    'social',
    'creativity'
  ];
};

// 카테고리 존재 여부 확인
export const isValidCategory = (categoryId) => {
  if (!categoryId) return false;
  
  const validCategories = getAllCategories();
  return validCategories.includes(categoryId);
};