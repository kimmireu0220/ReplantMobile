import { useState, useEffect, useCallback } from 'react';
import { getData, getStorageKeys, autoLevelupCharacter, setData } from '../services';
import { useUser } from '../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useCharacter = () => {
  const { currentNickname } = useUser();
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [representativeCharacter, setRepresentativeCharacter] = useState(null);
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
      
      // 해제일이 없는 캐릭터들에 대해 현재 시간으로 설정
      const updatedCharacters = charactersData.map(character => {
        if (!character.unlocked_date) {
          return {
            ...character,
            unlocked_date: new Date().toISOString()
          };
        }
        return character;
      });
      
      const sortedCharacters = updatedCharacters.sort((a, b) => a.level - b.level);

      // 업데이트된 캐릭터 데이터가 있으면 저장소에 저장
      if (updatedCharacters.some((char, index) => char !== charactersData[index])) {
        await setData(storageKeys.CHARACTERS, updatedCharacters);
      }

      // 대표 캐릭터 로드
      let representativeCategory = 'self_management'; // 기본값
      try {
        const storedCategory = await AsyncStorage.getItem(storageKeys.REPRESENTATIVE_CHARACTER);
        if (storedCategory) {
          representativeCategory = storedCategory; // JSON.parse 제거 - 문자열이므로
        }
      } catch (error) {
        console.log('대표 캐릭터 설정 로드 실패, 기본값 사용:', error);
      }
      
      const representativeChar = sortedCharacters.find(char => 
        char.category_id === representativeCategory
      );
      
      console.log('useCharacter - representativeCategory:', representativeCategory);
      console.log('useCharacter - sortedCharacters:', sortedCharacters);
      console.log('useCharacter - representativeChar:', representativeChar);
      console.log('useCharacter - charactersData length:', charactersData.length);
      console.log('useCharacter - updatedCharacters length:', updatedCharacters.length);
      
      // 캐릭터와 대표 캐릭터를 동시에 설정
      setCharacters(sortedCharacters);
      
      // 대표 캐릭터 설정 (안전한 fallback)
      if (representativeChar) {
        setRepresentativeCharacter(representativeChar);
      } else if (sortedCharacters.length > 0) {
        // 자기관리 캐릭터를 찾지 못하면 첫 번째 캐릭터 사용
        setRepresentativeCharacter(sortedCharacters[0]);
      } else {
        // 캐릭터가 아예 없으면 null
        setRepresentativeCharacter(null);
      }
      
      // 선택된 캐릭터가 없으면 첫 번째 캐릭터 선택
      if (sortedCharacters.length > 0 && !selectedCharacter) {
        setSelectedCharacter(sortedCharacters[0]);
      }
      
      // 모든 설정이 완료된 후 로딩 종료
      setLoading(false);
    } catch (loadError) {
      console.error('캐릭터 로드 실패:', loadError);
      setError(loadError.message);
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

  // 대표 캐릭터 설정
  const setRepresentative = useCallback(async (categoryId) => {
    try {
      const storageKeys = getStorageKeys(currentNickname);
      await setData(storageKeys.REPRESENTATIVE_CHARACTER, categoryId);
      
      const representativeChar = characters.find(char => char.category_id === categoryId);
      if (representativeChar) {
        setRepresentativeCharacter(representativeChar);
      }
      
      return { success: true };
    } catch (error) {
      console.error('대표 캐릭터 설정 실패:', error);
      return { success: false, error: error.message };
    }
  }, [characters, currentNickname]);

  return {
    characters,
    selectedCharacter,
    representativeCharacter,
    loading,
    error,
    loadCharacters,
    addExperienceByCategory,
    selectCharacter,
    setRepresentative,
  };
};

