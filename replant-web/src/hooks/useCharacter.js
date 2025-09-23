import { useState, useEffect, useCallback, useRef } from 'react';
import { characterService } from '../services/characterService';
import { 
  getUnlockedCharacters,
  getHighestLevelCharacter
} from '../data/characters';
import { getCurrentUserNickname } from '../config/supabase';
import { useCategory } from './useCategory';

// 사용자 설정 기본값 (닉네임 기반)
const getDefaultUserSettings = () => {
  const nickname = getCurrentUserNickname();
  return {
    selectedCharacterId: null, // Supabase에서 로드하므로 null로 초기화
    version: '3.0', // Supabase 기반 버전
    migrated: true, // Supabase 마이그레이션 완료
    nickname: nickname || null
  };
};

export const useCharacter = () => {
  const [characters, setCharacters] = useState({});
  const [userSettings, setUserSettings] = useState(getDefaultUserSettings());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { categories, getCategoryById } = useCategory();
  const [rawCharacters, setRawCharacters] = useState([]);
  const [templates, setTemplates] = useState({});
  
  // getCategoryById 참조를 안정화하기 위한 ref
  const getCategoryByIdRef = useRef(getCategoryById);
  getCategoryByIdRef.current = getCategoryById;

  // 원본 rows + 템플릿 + 카테고리 리졸버를 기반으로 표시용 맵을 구축
  const buildCharactersMap = useCallback((rows, templatesMap, resolveCategoryById) => {
    // 카테고리 메타가 아직 준비되지 않았을 때 사용할 폴백 메타데이터 (내부 정의로 의존성 고정)
    const getFallbackCategoryInfoLocal = (id) => ({
      id,
      name: '알 수 없는 카테고리',
      emoji: '❓',
      color: '#6B7280',
      description: ''
    });

    const map = {};
    rows.forEach((char) => {
      const categoryInfo = resolveCategoryById(char.category_id) || getFallbackCategoryInfoLocal(char.category_id);
      const appearance = templatesMap[char.level] || templatesMap[1] || {
        name: '씨앗',
        title: '새싹 꿈나무',
        defaultImage: 'level1/default.png',
        wavingImage: 'level1/waving.png',
        happyImage: 'level1/happy.png'
      };

      map[char.category_id] = {
        id: char.id, // 실제 데이터베이스 UUID 사용
        category: char.category_id,
        name: char.name, // 데이터베이스에서 가져온 이름
        categoryInfo: {
          id: categoryInfo.id,
          name: categoryInfo.name,
          emoji: categoryInfo.emoji,
          color: categoryInfo.color,
          description: categoryInfo.description
        },
        level: char.level,
        experience: char.experience,
        maxExperience: char.max_experience,
        totalExperience: char.total_experience,
        unlocked: char.unlocked,
        unlockedDate: char.unlocked_date,
        appearance: appearance,
        achievements: char.achievements || [],
        stats: char.stats || {
          missionsCompleted: 0,
          daysActive: 0,
          streak: 0,
          longestStreak: 0
        }
      };
    });
    return map;
  }, []);

  // 사용자 설정 로드 (useCallback으로 메모이제이션)
  const loadUserSettings = useCallback(async () => {
    try {
      const settings = await characterService.getUserSettings();
      return {
        selectedCharacterId: settings.selectedCharacterId || null,
        version: '3.0',
        migrated: true,
        nickname: getCurrentUserNickname() || null,
        ...settings
      };
    } catch (error) {
      return getDefaultUserSettings();
    }
  }, []);

  // 캐릭터 템플릿 로드 (useCallback으로 메모이제이션)
  const loadCharacterTemplates = useCallback(async () => {
    try {
      const templates = await characterService.getCharacterTemplates();
      if (templates) {
        const templatesMap = {};
        templates.forEach(template => {
          templatesMap[template.level] = {
            name: template.name,
            title: template.title,
            defaultImage: template.default_image,
            wavingImage: template.waving_image,
            happyImage: template.happy_image,
            description: template.description,
            experienceRequired: template.experience_required
          };
        });
        return templatesMap;
      }
      return {};
    } catch (error) {
      return {};
    }
  }, []);

  // 캐릭터 데이터 로드 - 카테고리 메타 로딩 순서와 무관하게 안정적으로 구성
  const loadCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 사용자 설정, 캐릭터 데이터, 템플릿을 병렬로 로드
      const [charactersData, settings, templatesMap] = await Promise.all([
        characterService.getUserCharacters(),
        loadUserSettings(),
        loadCharacterTemplates()
      ]);

      // 원본/템플릿 상태 보관
      setRawCharacters(charactersData || []);
      setTemplates(templatesMap || {});

      // 표시용 맵 1차 구성(카테고리 메타 없으면 폴백으로 생성)
      const initialMap = buildCharactersMap(
        charactersData || [],
        templatesMap || {},
        getCategoryByIdRef.current
      );

      setCharacters(initialMap);
      setUserSettings(settings);
    } catch (err) {
      // 에러가 발생해도 로딩 상태를 유지하고 에러 메시지는 설정하지 않음
      setCharacters({});
    } finally {
      setLoading(false);
    }
  }, [loadUserSettings, loadCharacterTemplates, buildCharactersMap]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  // 카테고리 또는 템플릿 준비가 늦게 끝나도 표시용 맵을 재구성하여 보정
  useEffect(() => {
    if (rawCharacters.length === 0) return;
    const rebuilt = buildCharactersMap(
      rawCharacters,
      templates,
      getCategoryByIdRef.current
    );
    setCharacters(rebuilt);
  }, [categories, templates, rawCharacters, buildCharactersMap]);

  // 경험치 추가 (useCallback으로 메모이제이션)
  const addExperience = useCallback(async (characterId, experiencePoints) => {
    
    const character = characters[characterId];
    
    // 캐릭터가 없으면 생성 시도
    if (!character) {
    } else if (!character.unlocked) {
    }

    try {
      const result = await characterService.addExperienceToCharacter(characterId, experiencePoints);
      
      if (result.success) {
        
        // 백엔드 응답을 완전히 신뢰하여 데이터 동기화
        setCharacters(prev => ({
          ...prev,
          [characterId]: result.character
        }));
        
        const finalResult = {
          success: true,
          levelUp: result.levelUp || false,
          newLevel: result.character?.level || character?.level,
          unlocked: result.unlocked || false,
          category: characterId, // 카테고리 정보 추가
          experience: experiencePoints
        };
        return finalResult;
      }
      return { 
        success: false, 
        error: '경험치 추가에 실패했습니다.' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || '경험치 추가에 실패했습니다.' 
      };
    }
  }, [characters]);

  // 카테고리별 경험치 추가 (useCallback으로 메모이제이션)
  const addExperienceByCategory = useCallback(async (category, experiencePoints = 50) => {
    const result = await addExperience(category, experiencePoints);
    return result;
  }, [addExperience]);

  // 캐릭터 해제
  const unlockCharacter = async (characterId) => {
    try {
      const result = await characterService.unlockCharacter(characterId);
      
      if (result.success) {
        // 백엔드 응답을 완전히 신뢰
        setCharacters(prev => ({
          ...prev,
          [characterId]: result.character
        }));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // 캐릭터 ID로 해제
  const unlockCharacterById = async (characterId) => {
    return await unlockCharacter(characterId);
  };

  // 대표 캐릭터 설정 (백엔드 저장만)
  const setSelectedCharacter = async (characterId) => {
    const character = characters[characterId];
    if (character && character.unlocked) {
      try {
        // Supabase에 저장
        const result = await characterService.setMainCharacter(characterId);
        
        if (result.success) {
          // 백엔드에서 설정을 다시 로드
          const updatedSettings = await loadUserSettings();
          setUserSettings(updatedSettings);
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  // 선택된 캐릭터 가져오기
  const getSelectedCharacter = () => {
    return characters[userSettings.selectedCharacterId] || null;
  };

  // 캐릭터 ID로 캐릭터 가져오기
  const getCharacterById = (characterId) => {
    // UUID로 직접 찾기
    const character = Object.values(characters).find(char => char.id === characterId);
    return character || null;
  };

  // 해제된 캐릭터 목록 가져오기
  const getUnlockedCharactersList = () => {
    return getUnlockedCharacters(characters);
  };

  // 최고 레벨 캐릭터 가져오기
  const getTopCharacter = () => {
    return getHighestLevelCharacter(getUnlockedCharactersList());
  };

  // 전체 통계 가져오기
  const getOverallStats = () => {
    const unlockedCharacters = getUnlockedCharactersList();
    return unlockedCharacters.reduce((stats, character) => ({
      totalLevel: stats.totalLevel + character.level,
      totalExperience: stats.totalExperience + character.totalExperience,
      totalMissionsCompleted: stats.totalMissionsCompleted + character.stats.missionsCompleted,
      averageLevel: Math.round((stats.totalLevel + character.level) / (stats.count + 1))
    }), { totalLevel: 0, totalExperience: 0, totalMissionsCompleted: 0, count: 0, averageLevel: 0 });
  };

  return {
    characters,
    selectedCharacter: getSelectedCharacter(),
    loading,
    error,
    addExperience,
    addExperienceByCategory,
    unlockCharacter,
    unlockCharacterById,
    setSelectedCharacter,
    getCharacterById,
    getUnlockedCharactersList,
    getTopCharacter,
    getOverallStats,
    userSettings,
    nickname: userSettings.nickname,
    loadCharacters
  };
};