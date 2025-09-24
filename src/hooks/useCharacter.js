import { useState, useEffect, useCallback } from 'react';
import { getData, getStorageKeys, autoLevelupCharacter } from '../services';
import { useUser } from '../contexts/UserContext';

export const useCharacter = () => {
  const { currentNickname } = useUser();
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 캐릭터 데이터 로드
  const loadCharacters = useCallback(async () => {
    if (!currentNickname) return;
    
    try {
      setLoading(true);
      setError(null);

      const storageKeys = getStorageKeys(currentNickname);
      const charactersData = await getData(storageKeys.CHARACTERS);
      const sortedCharacters = charactersData.sort((a, b) => a.level - b.level);

      setCharacters(sortedCharacters);
      
      // 선택된 캐릭터가 없으면 첫 번째 캐릭터 선택
      if (sortedCharacters.length > 0 && !selectedCharacter) {
        setSelectedCharacter(sortedCharacters[0]);
      }
    } catch (loadError) {
      console.error('캐릭터 로드 실패:', loadError);
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCharacter, currentNickname]);

  // 초기 로드
  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  // 경험치 추가 (카테고리별)
  const addExperienceByCategory = useCallback(async (categoryId, experience) => {
    try {
      // 해당 카테고리의 캐릭터 찾기
      const character = characters.find(char => char.category_id === categoryId);
      if (!character) return { success: false, error: '캐릭터를 찾을 수 없습니다.' };

      // autoLevelupCharacter 함수 사용
      const result = await autoLevelupCharacter(character.id, experience, currentNickname);
      
      if (result.success) {
        // 로컬 상태 업데이트
        setCharacters(prev => 
          prev.map(char => 
            char.id === character.id 
              ? result.character
              : char
          )
        );

        // 선택된 캐릭터도 업데이트
        if (selectedCharacter && selectedCharacter.id === character.id) {
          setSelectedCharacter(result.character);
        }
      }

      return result;
    } catch (expError) {
      console.error('경험치 추가 실패:', expError);
      return { success: false, error: expError.message };
    }
  }, [characters, selectedCharacter, currentNickname]);

  // 캐릭터 선택
  const selectCharacter = useCallback((character) => {
    setSelectedCharacter(character);
  }, []);

  return {
    characters,
    selectedCharacter,
    loading,
    error,
    loadCharacters,
    addExperienceByCategory,
    selectCharacter,
  };
};

