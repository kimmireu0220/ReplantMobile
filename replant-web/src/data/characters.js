
// 초기 캐릭터 상태 생성 (백엔드 카테고리 기반)
export const createInitialCharacterStates = () => {
  // 백엔드에서 카테고리를 동적으로 로드하므로 빈 객체 반환
  return {};
};

// 해제된 캐릭터 목록 가져오기
export const getUnlockedCharacters = (characters) => {
  return Object.values(characters).filter(character => character.unlocked);
};

// 최고 레벨 캐릭터 가져오기
export const getHighestLevelCharacter = (characters) => {
  if (!characters || characters.length === 0) return null;
  
  return characters.reduce((highest, current) => {
    if (current.level > highest.level) return current;
    if (current.level === highest.level && current.experience > highest.experience) return current;
    return highest;
  });
};

