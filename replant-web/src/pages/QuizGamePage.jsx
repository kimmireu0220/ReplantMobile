import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { tokens } from '../design/tokens';
import { Progress, ToastContainer } from '../components/ui';
import { useToast } from '../hooks';
import { gameService } from '../services';
import quizQuestionsData, { quizQuestions } from '../data/quizQuestions';

const QUESTION_TIME = 15; // 초

const QuizGamePage = () => {
  // 유틸: 배열 셔플 (Fisher–Yates)
  const shuffleArray = useCallback((array) => {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  // 질문 데이터 (정적) + 보기 셔플 및 정답 인덱스 재계산 (초기 1회)
  const questions = useMemo(() => {
    const base = quizQuestionsData || quizQuestions || [];
    const shuffledQuestions = shuffleArray(base);
    return shuffledQuestions.map((q) => {
      const optionIdx = q.options.map((_, idx) => idx);
      const shuffledIdx = shuffleArray(optionIdx);
      const shuffledOptions = shuffledIdx.map((i) => q.options[i]);
      const newAnswerIndex = shuffledIdx.indexOf(q.answerIndex);
      return {
        ...q,
        options: shuffledOptions,
        answerIndex: newAnswerIndex,
      };
    });
  }, [shuffleArray]);

  // 상태
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isHighScoreLoaded, setIsHighScoreLoaded] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // 전환/채점 중 입력 잠금
  const [focusedIndex, setFocusedIndex] = useState(-1); // 키보드 포커스용 인덱스 (초기 시각 강조 없음)
  const startedAtRef = useRef(Date.now());
  const timerRef = useRef(null);

  const { toasts, showSuccess, showError, removeToast } = useToast();

  // 최고 점수 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await gameService.getHighScore('quiz');
        if (mounted) setHighScore(s || 0);
      } catch (_) {
        // noop
      } finally {
        if (mounted) setIsHighScoreLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 타이머 설정
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // handleAnswer 최신 참조를 위한 ref
  const handleAnswerRef = useRef(() => {});

  // handleAnswer는 아래에서 정의되므로 이 훅은 정의 이후에 실행되어 최신 참조를 저장한다
  useEffect(() => {
    handleAnswerRef.current = (choiceIndex, isTimeOut) => handleAnswer(choiceIndex, isTimeOut);
  });

  const startTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(QUESTION_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // 시간 초과 → 오답 처리 후 다음 문제
          clearTimer();
          handleAnswerRef.current(null, true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (!gameOver && questions.length > 0) {
      startTimer();
    }
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, gameOver, questions.length, startTimer]);

  // 채점 및 다음 진행
  const goNext = useCallback(() => {
    setSelected(null);
    setIsLocked(false);
    setFocusedIndex(-1);
    if (currentIndex + 1 >= questions.length) {
      setGameOver(true);
      clearTimer();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, questions.length]);

  const handleAnswer = useCallback((choiceIndex, isTimeOut = false) => {
    if (isLocked || gameOver) return;
    setIsLocked(true);
    const q = questions[currentIndex];
    const isCorrect = choiceIndex !== null && choiceIndex === q.answerIndex;
    setSelected(choiceIndex);

    setScore((prev) => {
      if (isCorrect) {
        // const nextStreak = streak + 1;
        const bonus = 20 * streak; // 직전 연속수 기반 보너스
        return prev + 100 + bonus;
      }
      return prev;
    });
    setStreak((prev) => (isCorrect ? prev + 1 : 0));

    // 800ms 후 다음 문제로 이동
    setTimeout(() => {
      goNext();
    }, 800);
  }, [questions, currentIndex, goNext, isLocked, gameOver, streak]);

  // 재시작 핸들러 (다른 게임과 통일: 오버레이 클릭으로 재시작)
  const restartGame = useCallback(() => {
    startedAtRef.current = Date.now();
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setTimeLeft(QUESTION_TIME);
    setGameOver(false);
    setIsLocked(false);
  }, []);

  // 게임 종료 시 기록 저장
  useEffect(() => {
    const saveOnEnd = async () => {
      if (!gameOver) return;
      try {
        const durationMs = Math.max(0, Date.now() - startedAtRef.current);
        const result = await gameService.saveAndCheckRecord('quiz', {
          score,
          durationMs,
        });
        if (result.success && result.isNewHigh) {
          setHighScore(score);
          showSuccess(`🎉 새로운 최고 기록 달성! ${score}점`);
        }
      } catch (error) {
        showError('기록 저장 중 오류가 발생했습니다.');
      }
    };
    saveOnEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  // 안전 리셋: 문항 변경 시 선택/잠금/포커스 초기화 (경쟁 조건 방지)
  useEffect(() => {
    setSelected(null);
    setIsLocked(false);
    setFocusedIndex(-1);
  }, [currentIndex]);

  // UI 스타일
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.background.primary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing[4]
  };

  const containerStyle = {
    width: '100%',
    maxWidth: '560px',
    backgroundColor: tokens.colors.background.secondary,
    border: `1px solid ${tokens.colors.border.primary}`,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[6],
    boxShadow: tokens.shadow.base
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[4]
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary
  };

  const subTextStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary
  };

  const questionStyle = {
    fontSize: tokens.typography.fontSize.lg,
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
    marginBottom: tokens.spacing[4]
  };

  const optionsStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: tokens.spacing[3],
    marginBottom: tokens.spacing[4]
  };

  const footerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[2]
  };

  // const percent = questions.length > 0 ? Math.round(((currentIndex) / questions.length) * 100) : 0;
  const timePercent = Math.round((timeLeft / QUESTION_TIME) * 100);

  const currentQuestion = questions[currentIndex];

  // 세그먼트형 진행바
  const SegmentedProgress = ({ current, total }) => {
    const count = Math.max(0, total);
    const segments = Array.from({ length: count }, (_, i) => i);
    const containerStyle = {
      display: 'flex',
      gap: 4,
      width: '100%',
      marginBottom: tokens.spacing[1],
    };
    const baseStyle = {
      height: 8,
      borderRadius: tokens.borderRadius.full,
      flex: 1,
      transition: 'background-color 150ms ease',
      backgroundColor: tokens.colors.gray[200],
    };
    const doneStyle = { backgroundColor: tokens.colors.primary[500] };
    const currentStyle = { backgroundColor: tokens.colors.primary[600] };
    return (
      <div
        style={containerStyle}
        role="progressbar"
        aria-valuenow={Math.min(current + 1, total)}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="퀴즈 진행도"
      >
        {segments.map((i) => {
          const style = i < current ? { ...baseStyle, ...doneStyle } : i === current ? { ...baseStyle, ...currentStyle } : baseStyle;
          return <div key={i} style={style} />;
        })}
      </div>
    );
  };

  // 키보드 네비게이션: 화살표로 보기 이동, Enter/Space로 선택
  const handleKeyDown = useCallback((e) => {
    if (gameOver || !currentQuestion) return;
    const len = currentQuestion.options.length;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setFocusedIndex((idx) => Math.max(0, idx - 1));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      setFocusedIndex((idx) => Math.min(len - 1, idx + 1));
    } else if ((e.key === 'Enter' || e.key === ' ') && selected === null && !isLocked) {
      e.preventDefault();
      handleAnswer(focusedIndex);
    }
  }, [currentQuestion, focusedIndex, handleAnswer, isLocked, selected, gameOver]);

  return (
    <div style={pageStyle}>
      <main
        style={containerStyle}
        role="main"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="퀴즈 게임 영역"
      >
        {/* 헤더 */}
        <div style={headerStyle}>
          <div style={titleStyle}>💡 퀴즈 게임</div>
          {isHighScoreLoaded && (
            <div style={subTextStyle} aria-live="polite">최고 점수: {highScore.toLocaleString()}점</div>
          )}
        </div>

        {/* 진행도 */}
        <div style={{ marginBottom: tokens.spacing[2] }}>
          <SegmentedProgress current={currentIndex} total={questions.length} />
          <div style={subTextStyle} aria-live="polite">{currentIndex + 1} / {questions.length}</div>
        </div>

        {/* 질문 */}
        {currentQuestion ? (
          <div key={currentQuestion.id}>
            <div style={questionStyle}>{currentQuestion.question}</div>
            <div style={optionsStyle} role="group" aria-label="선택지">
              {currentQuestion.options.map((opt, idx) => {
                // const isFocused = selected === null && idx === focusedIndex;
                const isSelected = selected === idx;
                const isCorrectOption = idx === currentQuestion.answerIndex;
                const showingFeedback = selected !== null; // 확정 후 800ms 동안

                // 스타일 계산 (선택 전: 통일, 선택 후: 정답/오답 피드백)
                let borderColor = tokens.colors.border.primary;
                let bg = tokens.colors.background.primary;

                if (showingFeedback) {
                  if (isCorrectOption) {
                    borderColor = tokens.colors.success;
                    bg = 'rgba(34, 197, 94, 0.12)'; // success 라이트
                  } else if (isSelected) {
                    borderColor = tokens.colors.error;
                    bg = 'rgba(239, 68, 68, 0.12)'; // error 라이트
                  }
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAnswer(idx)}
                    disabled={selected !== null || isLocked}
                    style={{
                      textAlign: 'left',
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      border: `2px solid ${borderColor}`,
                      backgroundColor: bg,
                      cursor: selected !== null || isLocked ? 'default' : 'pointer',
                      fontSize: tokens.typography.fontSize.base,
                      color: tokens.colors.text.primary,
                      transition: 'all 150ms ease'
                    }}
                    aria-pressed={selected === idx}
                    aria-current={undefined}
                    tabIndex={-1}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* 하단 정보 */}
            <div style={footerStyle}>
              <div aria-live="polite" style={subTextStyle}>점수: {score.toLocaleString()}점</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <div style={{ minWidth: 64, ...subTextStyle }}>남은 시간</div>
                <div style={{ flex: 1 }}>
                  <Progress value={timePercent} max={100} color={timePercent <= 20 ? '#EF4444' : tokens.colors.primary[500]} ariaLabel="남은 시간" />
                </div>
                <div style={{ minWidth: 40, textAlign: 'right', ...subTextStyle }}>{timeLeft}s</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={subTextStyle}>문항을 불러오지 못했습니다.</div>
        )}
      </main>

      {/* 게임 오버 오버레이 (다른 게임과 통일) */}
      {gameOver && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: tokens.zIndex.modal,
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Game Over"
          onClick={restartGame}
        >
          <div style={{
            backgroundColor: 'transparent',
            padding: tokens.spacing[8],
            borderRadius: tokens.borderRadius.lg,
            textAlign: 'center',
            maxWidth: '420px',
            width: '92%',
            boxShadow: 'none',
            border: 'none'
          }}>
            <div style={{
              fontSize: tokens.typography.fontSize['4xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              marginBottom: tokens.spacing[4],
              color: tokens.colors.text.inverse,
              textShadow: '0 2px 8px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.35)'
            }}>
              Game Over
            </div>
            <div style={{
              display: 'inline-block',
              fontSize: tokens.typography.fontSize.xl,
              color: tokens.colors.text.inverse,
              fontWeight: tokens.typography.fontWeight.semibold,
              textShadow: '0 1px 3px rgba(0,0,0,0.45)'
            }}>
              다시 시작
            </div>
          </div>
        </div>
      )}

      {/* 토스트 */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default QuizGamePage;