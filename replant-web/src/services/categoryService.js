import { supabase } from '../config/supabase';

class CategoryService {
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id');
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      // 폴백: 기본 카테고리 데이터 반환
      return this.getFallbackCategories();
    }
  }

  async getCategoryById(id) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      return null;
    }
  }

  // 폴백 카테고리 데이터 (네트워크 오류 시 사용)
  getFallbackCategories() {
    return [
      {
        id: 'exercise',
        name: '운동',
        emoji: '🏃‍♂️',
        color: '#ef4444',
        description: '건강한 몸과 마음을 위한 운동 활동'
      },
      {
        id: 'cleaning',
        name: '청소',
        emoji: '🧹',
        color: '#3B82F6',
        description: '깨끗하고 정돈된 환경 만들기'
      },
      {
        id: 'reading',
        name: '독서',
        emoji: '📚',
        color: '#3b82f6',
        description: '지식과 상상력을 넓히는 독서 활동'
      },
      {
        id: 'selfcare',
        name: '자기돌봄',
        emoji: '🌸',
        color: '#8b5cf6',
        description: '자신을 돌보고 사랑하는 활동'
      },
      {
        id: 'social',
        name: '사회활동',
        emoji: '👥',
        color: '#f97316',
        description: '다른 사람들과의 소통과 연결'
      },
      {
        id: 'creativity',
        name: '창의활동',
        emoji: '🎨',
        color: '#ec4899',
        description: '창의성과 표현력을 기르는 활동'
      }
    ];
  }
}

export const categoryService = new CategoryService();
