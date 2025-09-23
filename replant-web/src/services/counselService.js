import { supabase, getCurrentUserId } from '../config/supabase';

class CounselService {
  async getSessionMessages(sessionId) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('counsel_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  async saveMessage(sessionId, message, isUser = true) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('counsel_messages')
        .insert({
          user_id: userId,
          session_id: sessionId,
          message: message,
          is_user: isUser,
          timestamp: new Date().toISOString()
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

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getUserSessions() {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('counsel_messages')
        .select('session_id, timestamp')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        throw error;
      }

      const sessions = {};
      data.forEach(message => {
        if (!sessions[message.session_id]) {
          sessions[message.session_id] = {
            sessionId: message.session_id,
            lastMessageTime: message.timestamp,
            messageCount: 0
          };
        }
        sessions[message.session_id].messageCount++;
      });

      return Object.values(sessions);
    } catch (error) {
      throw error;
    }
  }

  async deleteSession(sessionId) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { error } = await supabase
        .from('counsel_messages')
        .delete()
        .eq('user_id', userId)
        .eq('session_id', sessionId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  async getCounselStats() {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('counsel_messages')
        .select('session_id, is_user, timestamp')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      const stats = {
        totalSessions: new Set(data.map(msg => msg.session_id)).size,
        totalMessages: data.length,
        userMessages: data.filter(msg => msg.is_user).length,
        counselorMessages: data.filter(msg => !msg.is_user).length,
        lastSessionTime: data.length > 0 ? Math.max(...data.map(msg => new Date(msg.timestamp).getTime())) : null
      };

      return stats;
    } catch (error) {
      throw error;
    }
  }

  async getRecentMessages(limit = 10) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('counsel_messages')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }
}

export const counselService = new CounselService(); 