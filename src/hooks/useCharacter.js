import { useState, useEffect, useCallback } from 'react';
import { TABLES } from '../services/supabase';
import { useSupabase } from '../contexts/SupabaseContext';

export const useCharacter = () => {
  const { supabase } = useSupabase();
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 캐릭터 데이터 로드
  const loadCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from(TABLES.CHARACTERS)
        .select('*')
        .order('level', { ascending: true });

      if (queryError) throw queryError;

      setCharacters(data || []);
      
      // 선택된 캐릭터가 없으면 첫 번째 캐릭터 선택
      if (data && data.length > 0 && !selectedCharacter) {
        setSelectedCharacter(data[0]);
      }
    } catch (loadError) {
      console.error('캐릭터 로드 실패:', loadError);
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedCharacter]);

  // 초기 로드
  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  // 경험치 추가 (카테고리별)
  const addExperienceByCategory = useCallback(async (categoryId, experience) => {
    try {
      // 해당 카테고리의 캐릭터 찾기
      const character = characters.find(char => char.category_id === categoryId);
      if (!character) return;

      // 경험치 추가
      const newExperience = (character.experience || 0) + experience;
      const newLevel = Math.floor(newExperience / 100) + 1; // 100 경험치당 1레벨

      // 캐릭터 업데이트
      const { error: updateError } = await supabase
        .from(TABLES.CHARACTERS)
        .update({ 
          experience: newExperience,
          level: newLevel 
        })
        .eq('id', character.id);

      if (updateError) throw updateError;

      // 로컬 상태 업데이트
      setCharacters(prev => 
        prev.map(char => 
          char.id === character.id 
            ? { ...char, experience: newExperience, level: newLevel }
            : char
        )
      );

      return { 
        success: true, 
        newLevel, 
        experience: newExperience,
        levelUp: newLevel > character.level 
      };
    } catch (expError) {
      console.error('경험치 추가 실패:', expError);
      return { success: false, error: expError.message };
    }
  }, [characters, supabase]);

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

