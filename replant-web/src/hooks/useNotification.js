import { useState, useCallback } from 'react';
import { tokens } from '../design/tokens';
import { useCategory } from './useCategory';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const { getCategoryById } = useCategory();

  // removeNotification을 먼저 정의
  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const filtered = prev.filter(notification => notification.id !== id);
      return filtered;
    });
  }, []);

  // 알림 추가
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = {
      ...notification,
      id,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [...prev, newNotification]);

    // 자동 제거 (3초 후)
    setTimeout(() => {
      removeNotification(id);
    }, 3000);

    return id;
  }, [removeNotification]);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // 미션 완료 알림
  const showMissionComplete = useCallback((mission, onClick) => {
    const categoryInfo = getCategoryById(mission.category);
    const experiencePoints = mission.experience || 50;
    
    addNotification({
      type: 'success',
      title: '미션 완료!',
      message: `${categoryInfo?.name || '캐릭터'} +${experiencePoints} 경험치`,
      category: categoryInfo?.name || '미션',
      categoryId: mission.category, // 카테고리 ID 직접 저장
      emoji: '', // 이모지 제거
      color: categoryInfo?.color || tokens.colors.success.main,
      hideCloseButton: true // X 버튼 숨김
    });
  }, [addNotification, getCategoryById]);

  // 경험치 획득 알림
  const showExperienceGained = useCallback((amount, categoryId) => {
    const categoryInfo = getCategoryById(categoryId);
    
    addNotification({
      type: 'info',
      title: '경험치 획득! ⭐',
      message: `+${amount} 경험치`,
      category: categoryInfo?.name || '경험치',
      emoji: categoryInfo?.emoji || '⭐',
      color: categoryInfo?.color || tokens.colors.info.main,
      action: {
        label: '확인',
        onClick: () => {}
      }
    });
  }, [addNotification, getCategoryById]);

  // 레벨업 알림
  const showLevelUp = useCallback((newLevel, categoryId, onClick) => {
    const categoryInfo = getCategoryById(categoryId);
    
    addNotification({
      type: 'success',
      title: '레벨업!',
      message: `레벨 ${newLevel} 달성`,
      category: categoryInfo?.name || '레벨업',
      categoryId: categoryId, // 카테고리 ID 직접 저장
      emoji: '', // 이모지 제거
      color: categoryInfo?.color || tokens.colors.success.main
    });
  }, [addNotification, getCategoryById]);

  // 캐릭터 해제 알림
  const showCharacterUnlocked = useCallback((categoryId, onClick) => {
    const categoryInfo = getCategoryById(categoryId);
    
    addNotification({
      type: 'success',
      title: '캐릭터 해제! 🎊',
      message: `새로운 ${categoryInfo?.name || '캐릭터'} 해제`,
      category: categoryInfo?.name || '캐릭터',
      categoryId: categoryId, // 카테고리 ID 직접 저장
      emoji: categoryInfo?.emoji || '🎊',
      color: categoryInfo?.color || tokens.colors.success.main
    });
  }, [addNotification, getCategoryById]);

  // 에러 알림
  const showError = useCallback((title, message) => {
    addNotification({
      type: 'error',
      title: title || '오류 발생',
      message: message || '알 수 없는 오류가 발생했습니다.',
      category: '오류',
      emoji: '⚠️',
      color: tokens.colors.error.main,
      action: {
        label: '확인',
        onClick: () => {}
      }
    });
  }, [addNotification]);

  // 일반 알림
  const showInfo = useCallback((title, message, options = {}) => {
    addNotification({
      type: 'info',
      title,
      message,
      category: options.category || '알림',
      emoji: options.emoji || 'ℹ️',
      color: options.color || tokens.colors.info.main,
      action: options.action || {
        label: '확인',
        onClick: () => {}
      }
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    showMissionComplete,
    showExperienceGained,
    showLevelUp,
    showCharacterUnlocked,
    showError,
    showInfo
  };
}; 