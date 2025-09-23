import React, { useEffect, useState } from 'react';
import { tokens } from '../../design/tokens';
import { useQuiz } from '../../hooks/useQuiz';
import { useNotification } from '../../hooks/useNotification';

const QuizModal = ({ missionId, onComplete, onCancel }) => {
  const {
    currentQuestion,
    answers,
    isLoading,
    error,
    startQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    isCurrentQuestionAnswered
  } = useQuiz();

  const { showError } = useNotification();
  const [quiz, setQuiz] = useState(null);
  const [answerStates, setAnswerStates] = useState([]); // 각 문제별 정답/오답 상태

  // CSS 애니메이션 스타일 추가
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* 퀴즈 네비게이션 버튼 focus 스타일 제거 */
      .quiz-nav-button:focus {
        outline: none;
        box-shadow: none;
      }
      
      /* 퀴즈 선택지 버튼 focus 스타일 제거 */
      .quiz-option-button:focus {
        outline: none;
        box-shadow: none;
      }
      
      /* 닫기 버튼 focus 스타일 제거 */
      .quiz-close-button:focus {
        outline: none;
        box-shadow: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const quizData = startQuiz(missionId);
    setQuiz(quizData);
    if (quizData) {
      // 답변 상태 초기화 (null: 미답변, 'correct': 정답, 'incorrect': 오답)
      setAnswerStates(new Array(quizData.questions.length).fill(null));
    }
    

  }, [missionId, startQuiz]);

  useEffect(() => {
    if (error) {
      showError('퀴즈 오류', error);
    }
  }, [error, showError]);



  const handleAnswerSelect = (answerIndex) => {
    // 이미 답변한 문제는 선택 불가
    if (answerStates[currentQuestion] !== null) return;
    
    // 정답 확인
    const currentQuestionData = quiz.questions[currentQuestion];
    const isCorrect = answerIndex === currentQuestionData.correctAnswer;
    
    // 답변 저장
    selectAnswer(answerIndex);
    
    // 정답/오답 상태 업데이트
    setAnswerStates(prev => {
      const newStates = [...prev];
      newStates[currentQuestion] = isCorrect ? 'correct' : 'incorrect';
      return newStates;
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      nextQuestion();
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      prevQuestion();
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await submitQuiz(missionId);
      if (result.success) {
        // 바로 완료 처리
        onComplete?.();
      }
    } catch (error) {
      console.error('퀴즈 제출 실패:', error);
    }
  };



  // 선택지 스타일 결정 함수
  const getOptionStyle = (optionIndex) => {
    const currentAnswerState = answerStates[currentQuestion];
    const currentQuestionData = quiz.questions[currentQuestion];
    const selectedAnswer = answers[currentQuestion];
    const isCorrectAnswer = optionIndex === currentQuestionData.correctAnswer;
    const isSelectedAnswer = optionIndex === selectedAnswer;

    let style = { ...optionButtonStyle };

    // 답변하지 않은 경우 - 기본 스타일
    if (currentAnswerState === null) {
      if (isSelectedAnswer) {
        style = { ...style, ...selectedOptionStyle };
      }
      return style;
    }

    // 답변한 경우 - 모든 선택지 비활성화
    style = { ...style, ...disabledOptionStyle };

    // 정답 표시 (항상 초록색)
    if (isCorrectAnswer) {
      style = { ...style, ...correctAnswerStyle };
    }
    // 오답 선택지 표시 (선택했지만 틀린 경우에만 빨간색)
    else if (isSelectedAnswer && currentAnswerState === 'incorrect') {
      style = { ...style, ...incorrectAnswerStyle };
    }

    return style;
  };

  const handleClose = () => {
    onCancel?.();
  };

  if (!quiz) {
    return (
      <div style={overlayStyle}>
        <div style={containerStyle}>
          <div style={loadingStyle}>퀴즈를 불러오는 중...</div>
        </div>
      </div>
    );
  }



  const currentQuestionData = quiz.questions[currentQuestion];

  return (
    <div style={overlayStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{quiz.title}</h2>
          <button onClick={handleClose} style={closeButtonStyle} className="quiz-close-button">✕</button>
        </div>
        
        

        
        {/* 문제 */}
        <div style={questionContainerStyle}>
          <h3 style={questionTitleStyle}>
            문제 {currentQuestion + 1}
          </h3>
          <p style={questionTextStyle}>{currentQuestionData.question}</p>
          
          <div style={optionsContainerStyle}>
            {currentQuestionData.options.map((option, index) => {
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  style={getOptionStyle(index)}
                  className="quiz-option-button"
                >
                  <span style={optionLetterStyle}>
                    {String.fromCharCode(65 + index) + '.'}
                  </span>
                  <span style={optionTextStyle}>{option}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* 네비게이션 버튼 */}
        <div style={navigationStyle}>
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            style={{
              ...navButtonStyle,
              opacity: currentQuestion === 0 ? 0.5 : 1,
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer'
            }}
            className="quiz-nav-button"
          >
            ← 이전
          </button>
          
          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isCurrentQuestionAnswered()}
              style={{
                ...navButtonStyle,
                opacity: !isCurrentQuestionAnswered() ? 0.5 : 1,
                cursor: !isCurrentQuestionAnswered() ? 'not-allowed' : 'pointer'
              }}
              className="quiz-nav-button"
            >
              다음 →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                ...submitButtonStyle,
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              className="quiz-nav-button"
            >
              {isLoading ? '⏳ 제출 중...' : '✓ 퀴즈 제출'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 스타일 정의
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: tokens.spacing.md
};

const containerStyle = {
  backgroundColor: tokens.colors.background.primary,
  borderRadius: tokens.borderRadius.lg,
  padding: `${tokens.spacing[12]} ${tokens.spacing[16]}`,
  maxWidth: '700px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: tokens.shadow.xl
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: tokens.spacing.xl,
  paddingBottom: tokens.spacing.lg,
  paddingTop: tokens.spacing[4],
  borderBottom: `2px solid ${tokens.colors.border.primary}`
};

const titleStyle = {
  margin: 0,
  fontSize: tokens.typography.fontSize.xxl,
  fontWeight: tokens.typography.fontWeight.bold,
  color: tokens.colors.text.primary
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '2rem',
  cursor: 'pointer',
  color: tokens.colors.text.primary,
  padding: tokens.spacing.md,
  minWidth: '40px',
  minHeight: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};







const questionContainerStyle = {
  marginBottom: tokens.spacing.xl,
  paddingLeft: tokens.spacing.md,
  paddingRight: tokens.spacing.md
};

const questionTitleStyle = {
  fontSize: tokens.typography.fontSize.xxl,
  fontWeight: tokens.typography.fontWeight.semibold,
  marginBottom: tokens.spacing.xl,
  color: tokens.colors.text.primary
};

const questionTextStyle = {
  fontSize: tokens.typography.fontSize.xl,
  lineHeight: 1.6,
  marginBottom: tokens.spacing.xl,
  color: tokens.colors.text.primary
};

const optionsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing.lg,
  paddingLeft: tokens.spacing.sm,
  paddingRight: tokens.spacing.sm
};

const optionButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  paddingTop: tokens.spacing.lg,
  paddingBottom: tokens.spacing.lg,
  paddingLeft: '20px',
  paddingRight: tokens.spacing.lg,
  minHeight: '60px',
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: tokens.colors.border.light,
  borderRadius: tokens.borderRadius.md,
  backgroundColor: tokens.colors.background.primary,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textAlign: 'left',
  width: '100%',
  color: tokens.colors.text.primary,
  fontSize: tokens.typography.fontSize.lg,
  position: 'relative'
};

const selectedOptionStyle = {
  borderColor: tokens.colors.primary.main,
  backgroundColor: tokens.colors.primary.main,
  color: tokens.colors.text.white
};



const correctAnswerStyle = {
  borderColor: tokens.colors.success,
  backgroundColor: tokens.colors.success,
  color: tokens.colors.text.inverse,
  boxShadow: `0 0 0 2px ${tokens.colors.success}33`
};

const incorrectAnswerStyle = {
  borderColor: tokens.colors.error,
  backgroundColor: tokens.colors.error,
  color: tokens.colors.text.inverse,
  boxShadow: `0 0 0 2px ${tokens.colors.error}33`
};

const disabledOptionStyle = {
  pointerEvents: 'none',
  cursor: 'default'
};



const optionLetterStyle = {
  fontSize: tokens.typography.fontSize.xl,
  fontWeight: tokens.typography.fontWeight.bold,
  marginRight: tokens.spacing.lg,
  minWidth: '40px',
  color: tokens.colors.text.primary
};

const optionTextStyle = {
  flex: 1,
  color: tokens.colors.text.primary
};

const navigationStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: tokens.spacing[4],
  marginTop: tokens.spacing.md,
  paddingTop: tokens.spacing.md,
  flexWrap: 'wrap'
};

const navButtonStyle = {
  padding: `${tokens.spacing[3]} ${tokens.spacing[5]}`,
  minHeight: '48px',
  minWidth: '100px',
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: tokens.colors.border.light,
  borderRadius: tokens.borderRadius.lg,
  backgroundColor: tokens.colors.background.primary,
  color: tokens.colors.text.primary,
  cursor: 'pointer',
  fontSize: tokens.typography.fontSize.lg,
  fontWeight: tokens.typography.fontWeight.semibold,
  transition: 'all 0.3s ease',
  boxShadow: tokens.shadow.sm,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  outline: 'none'
};



const submitButtonStyle = {
  ...navButtonStyle,
  backgroundColor: tokens.colors.primary[500],
  color: tokens.colors.text.inverse,
  borderColor: tokens.colors.primary[500],
  boxShadow: `${tokens.shadow.md}, 0 0 0 0 ${tokens.colors.primary[200]}`,
  fontWeight: tokens.typography.fontWeight.bold
};



const loadingStyle = {
  textAlign: 'center',
  fontSize: tokens.typography.fontSize.lg,
  color: tokens.colors.text.secondary
};



export default QuizModal;
