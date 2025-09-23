import { supabase, ensureNicknameSession, getCurrentUserId } from '../config/supabase';

class QuizService {
  /**
   * 퀴즈 점수 계산
   * @param {Array} answers - 사용자 답변 배열
   * @param {Array} questions - 퀴즈 문제 배열
   * @returns {Object} 점수 정보
   */
  calculateScore(answers, questions) {
    let correctCount = 0;
    const results = [];

    questions.forEach((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      if (isCorrect) {
        correctCount++;
      }
      
      results.push({
        questionId: question.id,
        userAnswer: answers[index],
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const isPassed = score >= 80; // 기본 통과 점수 80%

    return {
      score,
      correctCount,
      totalQuestions: questions.length,
      isPassed,
      results
    };
  }

  /**
   * 퀴즈 완료 처리 (무조건 미션 완료)
   * @param {string} missionId - 미션 ID
   * @returns {Promise<Object>} 완료 결과
   */
  async completeQuiz(missionId) {
    try {
      await ensureNicknameSession();
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }
      // 미션 완료 처리
      const { data, error } = await supabase
        .from('missions')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('mission_id', missionId)
        .eq('user_id', userId)
        .select();

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: '퀴즈 완료!',
        missionData: data[0]
      };

    } catch (error) {
      console.error('퀴즈 완료 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 퀴즈 결과 조회
   * @param {string} missionId - 미션 ID
   * @returns {Promise<Object>} 퀴즈 결과
   */
  async getQuizResult(missionId) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('quiz_score, quiz_completed_at, quiz_time_spent, quiz_answers')
        .eq('mission_id', missionId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('퀴즈 결과 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 퀴즈 통계 조회
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 퀴즈 통계
   */
  async getQuizStats(userId) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('quiz_score, quiz_time_spent')
        .eq('user_id', userId)
        .not('quiz_score', 'is', null);

      if (error) {
        throw error;
      }

      const totalQuizzes = data.length;
      const averageScore = totalQuizzes > 0 
        ? Math.round(data.reduce((sum, mission) => sum + mission.quiz_score, 0) / totalQuizzes)
        : 0;
      const totalTime = data.reduce((sum, mission) => sum + (mission.quiz_time_spent || 0), 0);

      return {
        totalQuizzes,
        averageScore,
        totalTime,
        completedQuizzes: data.filter(mission => mission.quiz_score >= 80).length
      };
    } catch (error) {
      console.error('퀴즈 통계 조회 실패:', error);
      throw error;
    }
  }
}

export const quizService = new QuizService();
