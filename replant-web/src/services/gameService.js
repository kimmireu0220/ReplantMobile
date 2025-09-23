import { supabase, getCurrentUserId } from './index';

class GameService {
  // 🎯 게임 결과 저장 (통일된 방식)
  async saveGameResult(gameType, { score, distance = 0, durationMs = 0, characterId = null }) {
    try {
      const userId = await getCurrentUserId();
      
      const { error } = await supabase
        .from('game_results')
        .insert({
          user_id: userId,
          game_type: gameType,
          final_score: score,
          total_distance: distance,
          game_duration_seconds: Math.floor(durationMs / 1000),
          character_id: characterId,
        });
      
      if (error) return { success: false, error };
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  // 🏆 게임별 최고점수 조회
  async getHighScore(gameType) {
    try {
      const userId = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('game_results')
        .select('final_score')
        .eq('user_id', userId)
        .eq('game_type', gameType)
        .order('final_score', { ascending: false })
        .limit(1);
      
      if (error) return 0;
      return data?.[0]?.final_score || 0;
    } catch (error) {
      return 0;
    }
  }

  // 📊 모든 게임 최고점수 조회
  async getAllHighScores() {
    try {
      const userId = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('game_results')
        .select('game_type, final_score')
        .eq('user_id', userId)
        .order('final_score', { ascending: false });
      
      if (error) return {};
      
      // 게임별 최고점수 정리
      const highScores = {};
      ['obstacle', 'puzzle', 'memory', 'quiz'].forEach(gameType => {
        const gameData = data.filter(item => item.game_type === gameType);
        highScores[gameType] = gameData.length > 0 ? gameData[0].final_score : 0;
      });
      
      return highScores;
    } catch (error) {
      return {};
    }
  }

  // 🆕 새 기록 여부 확인
  async isNewHighScore(gameType, score) {
    try {
      const currentHigh = await this.getHighScore(gameType);
      return score > currentHigh;
    } catch (error) {
      return false;
    }
  }

  // 📈 게임 결과 저장 + 새 기록 확인 (통합 메서드)
  async saveAndCheckRecord(gameType, gameData) {
    try {
      const { score } = gameData;
      const isNewHigh = await this.isNewHighScore(gameType, score);
      const result = await this.saveGameResult(gameType, gameData);
      
      return {
        success: result.success,
        isNewHigh: isNewHigh,
        error: result.error
      };
    } catch (error) {
      return { success: false, isNewHigh: false, error };
    }
  }
}

export const gameService = new GameService();



