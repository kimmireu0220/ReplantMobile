import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';

export const useCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const getCategoryById = useCallback((id) => {
    return categories.find(category => category.id === id);
  }, [categories]);

  const getCategoryColor = useCallback((id) => {
    const category = getCategoryById(id);
    return category?.color || '#6B7280'; // 기본 회색
  }, [getCategoryById]);

  const getCategoryEmoji = useCallback((id) => {
    const category = getCategoryById(id);
    return category?.emoji || '❓';
  }, [getCategoryById]);

  const getCategoryName = useCallback((id) => {
    const category = getCategoryById(id);
    return category?.name || '알 수 없는 카테고리';
  }, [getCategoryById]);

  return {
    categories,
    loading,
    error,
    getCategoryById,
    getCategoryColor,
    getCategoryEmoji,
    getCategoryName,
    reloadCategories: loadCategories
  };
};
