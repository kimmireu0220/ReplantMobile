import { supabase } from '../config/supabase';

class EmotionService {
  async getEmotions() {
    try {
      const { data, error } = await supabase
        .from('emotions')
        .select('*')
        .order('id');
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      // 폴백: 기본 감정 데이터 반환
      return this.getFallbackEmotions();
    }
  }

  async getEmotionById(id) {
    try {
      const { data, error } = await supabase
        .from('emotions')
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

  // 폴백 감정 데이터 (네트워크 오류 시 사용)
  getFallbackEmotions() {
    return [
      {
        id: 'happy',
        emoji: '😊',
        label: '행복한',
        color: '#10B981',
        description: '기쁘고 즐거운 감정'
      },
      {
        id: 'excited',
        emoji: '🤩',
        label: '신나는',
        color: '#F59E0B',
        description: '흥미롭고 재미있는 감정'
      },
      {
        id: 'calm',
        emoji: '😌',
        label: '평온한',
        color: '#3B82F6',
        description: '차분하고 안정적인 감정'
      },
      {
        id: 'grateful',
        emoji: '🙏',
        label: '감사한',
        color: '#8B5CF6',
        description: '감사하고 고마운 감정'
      },
      {
        id: 'sad',
        emoji: '😢',
        label: '슬픈',
        color: '#6B7280',
        description: '우울하고 슬픈 감정'
      },
      {
        id: 'angry',
        emoji: '😠',
        label: '화난',
        color: '#EF4444',
        description: '분노하고 화난 감정'
      },
      {
        id: 'anxious',
        emoji: '😰',
        label: '불안한',
        color: '#F97316',
        description: '걱정되고 불안한 감정'
      },
      {
        id: 'tired',
        emoji: '😴',
        label: '피곤한',
        color: '#6366F1',
        description: '지치고 피곤한 감정'
      }
    ];
  }
}

export const emotionService = new EmotionService();
