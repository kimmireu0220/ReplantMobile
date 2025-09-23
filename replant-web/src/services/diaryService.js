import { supabase, getCurrentUserId, ensureNicknameSession } from '../config/supabase';

class DiaryService {
  async getUserDiaries() {
    try {
      await ensureNicknameSession();
      
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  async getDiaryByDate(date) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async saveDiary(date, emotionId, content) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const now = new Date();
      const { data, error } = await supabase
        .from('diaries')
        .insert({
          user_id: userId,
          date: date,
          emotion_id: emotionId,
          content: content,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateDiary(diaryId, date, emotionId, content) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('diaries')
        .update({
          date: date,
          emotion_id: emotionId,
          content: content,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('id', diaryId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async deleteDiary(diaryId) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { error } = await supabase
        .from('diaries')
        .delete()
        .eq('user_id', userId)
        .eq('id', diaryId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  async getEmotionStats() {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('diaries')
        .select('emotion_id')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      const emotionStats = {};
      data.forEach(diary => {
        const emotionId = diary.emotion_id;
        emotionStats[emotionId] = (emotionStats[emotionId] || 0) + 1;
      });

      return emotionStats;
    } catch (error) {
      throw error;
    }
  }

  async getRecentDiaries(limit = 7) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  async getMonthlyDiaryCount(year, month) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

      const { data, error } = await supabase
        .from('diaries')
        .select('date')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        throw error;
      }

      return data.length;
    } catch (error) {
      throw error;
    }
  }
}

export const diaryService = new DiaryService(); 