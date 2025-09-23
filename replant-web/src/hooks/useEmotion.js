import { useState, useEffect, useCallback } from 'react';
import { emotionService } from '../services/emotionService';

export const useEmotion = () => {
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEmotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const emotionsData = await emotionService.getEmotions();
      setEmotions(emotionsData);
    } catch (err) {
      setError(err.message);
      setEmotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmotions();
  }, [loadEmotions]);

  const getEmotionById = useCallback((id) => {
    return emotions.find(emotion => emotion.id === id);
  }, [emotions]);

  const getEmotionColor = useCallback((id) => {
    const emotion = getEmotionById(id);
    return emotion?.color || '#6B7280'; // 기본 회색
  }, [getEmotionById]);

  return {
    emotions,
    loading,
    error,
    getEmotionById,
    getEmotionColor,
    reloadEmotions: loadEmotions
  };
};
