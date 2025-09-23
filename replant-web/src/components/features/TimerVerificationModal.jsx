import React, { useState, useEffect } from 'react';
import { tokens } from '../../design/tokens';
import { useTheme } from '../../contexts/ThemeContext';
import { useTimerVerification } from '../../hooks/useTimerVerification';
import { useNotification } from '../../hooks/useNotification';

const TimerVerificationModal = ({ 
  missionId, 
  onComplete, 
  onCancel 
}) => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  
  const {
    isRunning,
    currentTime,
    duration,
    progress,
    isCompleted,
    error,
    isLoading,
    screenSize,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    completeMission,
    clearError,
    formatTime
  } = useTimerVerification();

  const { showError, showInfo } = useNotification();
  const [localLoading, setLocalLoading] = useState(false);

  // 반응형 스타일 계산
  const isMobile = screenSize.isMobile;
  const isTablet = screenSize.isTablet;

  // 타이머 시작
  const handleStartTimer = async () => {
    try {
      setLocalLoading(true);
      await startTimer(missionId);
      showInfo('타이머 시작', '5분 타이머가 시작되었습니다! ⏱️');
    } catch (error) {
      showError('타이머 시작 실패', '타이머를 시작할 수 없습니다. 다시 시도해주세요.');
    } finally {
      setLocalLoading(false);
    }
  };

  // 미션 완료 처리
  const handleCompleteMission = async () => {
    try {
      setLocalLoading(true);
      await completeMission(missionId);
      showInfo('미션 완료', '타이머 미션이 완료되었습니다! 🎉');
      onComplete?.();
    } catch (error) {
      showError('미션 완료 실패', error.message || '미션 완료에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLocalLoading(false);
    }
  };

  // 에러 처리
  useEffect(() => {
    if (error) {
      showError('오류 발생', error);
      clearError();
    }
  }, [error, showError, clearError]);

  // 원형 프로그레스 바 계산
  const radius = isMobile ? 50 : isTablet ? 60 : 70;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div style={overlayStyle}>
      <div style={{
        ...containerStyle,
        ...(isDark && darkModeStyles),
        ...(isMobile && mobileContainerStyle),
        ...(isTablet && tabletContainerStyle)
      }}>
        {/* 헤더 */}
        <div style={headerStyle}>
          <h2 style={{
            ...titleStyle,
            ...(isMobile && mobileTitleStyle),
            ...(isTablet && tabletTitleStyle)
          }}>
            ⏱️ 타이머 인증
          </h2>
          <button 
            onClick={onCancel}
            style={closeButtonStyle}
            aria-label="모달 닫기"
          >
            ✕
          </button>
        </div>

        {/* 타이머 디스플레이 */}
        <div style={timerDisplayStyle}>
          {/* 원형 프로그레스 바 */}
          <div style={progressContainerStyle}>
            <svg
              width={(radius + strokeWidth) * 2}
              height={(radius + strokeWidth) * 2}
              style={svgStyle}
            >
              {/* 배경 원 */}
              <circle
                cx={radius + strokeWidth}
                cy={radius + strokeWidth}
                r={radius}
                stroke={isDark ? 'var(--color-border-light)' : tokens.colors.border.light}
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* 진행률 원 */}
              <circle
                cx={radius + strokeWidth}
                cy={radius + strokeWidth}
                r={radius}
                stroke={isDark ? 'var(--color-primary-500)' : tokens.colors.primary[500]}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${radius + strokeWidth} ${radius + strokeWidth})`}
                style={{
                  transition: 'stroke-dashoffset 0.3s ease'
                }}
              />
            </svg>
            
            {/* 중앙 시간 표시 */}
            <div style={timeDisplayStyle}>
              <div style={{
                ...timeTextStyle,
                ...(isMobile && mobileTimeTextStyle),
                ...(isTablet && tabletTimeTextStyle)
              }}>
                {formatTime(currentTime)}
              </div>
              <div style={{
                ...timeLabelStyle,
                ...(isMobile && mobileTimeLabelStyle),
                ...(isTablet && tabletTimeLabelStyle)
              }}>
                / {formatTime(duration)}
              </div>
            </div>
          </div>

          {/* 진행률 퍼센트 */}
          <div style={{
            ...progressTextStyle,
            ...(isMobile && mobileProgressTextStyle),
            ...(isTablet && tabletProgressTextStyle)
          }}>
            {Math.round(progress)}% 완료
          </div>
        </div>



        {/* 컨트롤 버튼들 */}
        <div style={controlsStyle}>
          {!isRunning && !isCompleted && (
            <button
              onClick={handleStartTimer}
              disabled={localLoading || isLoading}
              style={{
                ...controlButtonStyle,
                ...(isDark && darkControlButtonStyle),
                ...(isMobile && mobileControlButtonStyle),
                ...(isTablet && tabletControlButtonStyle)
              }}
            >
              {localLoading ? '시작 중...' : '시작'}
            </button>
          )}

          {isRunning && (
            <button
              onClick={pauseTimer}
              style={{
                ...controlButtonStyle,
                ...(isDark && darkControlButtonStyle),
                ...(isMobile && mobileControlButtonStyle),
                ...(isTablet && tabletControlButtonStyle)
              }}
            >
              일시정지
            </button>
          )}

          {!isRunning && currentTime > 0 && !isCompleted && (
            <button
              onClick={resumeTimer}
              style={{
                ...controlButtonStyle,
                ...(isDark && darkControlButtonStyle),
                ...(isMobile && mobileControlButtonStyle),
                ...(isTablet && tabletControlButtonStyle)
              }}
            >
              재시작
            </button>
          )}

          {currentTime > 0 && !isCompleted && (
            <button
              onClick={resetTimer}
              style={{
                ...resetButtonStyle,
                ...(isDark && darkResetButtonStyle),
                ...(isMobile && mobileControlButtonStyle),
                ...(isTablet && tabletControlButtonStyle)
              }}
            >
              리셋
            </button>
          )}
        </div>

        {/* 완료 버튼 */}
        {isCompleted && (
          <div style={completeSectionStyle}>
            <p style={completeTextStyle}>
              🎉 타이머가 완료되었습니다!
            </p>
            <button
              onClick={handleCompleteMission}
              disabled={localLoading}
              style={{
                ...completeButtonStyle,
                ...(isDark && darkCompleteButtonStyle),
                ...(isMobile && mobileCompleteButtonStyle),
                ...(isTablet && tabletCompleteButtonStyle)
              }}
            >
              {localLoading ? '완료 중...' : '✅ 미션 완료'}
            </button>
          </div>
        )}


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
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: tokens.spacing[4]
};

const containerStyle = {
  backgroundColor: tokens.colors.background.primary,
  borderRadius: tokens.borderRadius.lg,
  padding: tokens.spacing[6],
  maxWidth: '500px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: `0 10px 40px ${tokens.shadow.lg}`,
  border: `1px solid ${tokens.colors.border.light}`
};

const darkModeStyles = {
  backgroundColor: 'var(--color-background-primary)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border-light)'
};

const mobileContainerStyle = {
  padding: tokens.spacing[4],
  maxWidth: '100%',
  margin: tokens.spacing[2]
};

const tabletContainerStyle = {
  padding: tokens.spacing[5],
  maxWidth: '600px'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: tokens.spacing[8]
};

const titleStyle = {
  margin: 0,
  fontSize: tokens.typography.fontSize.xl,
  fontWeight: tokens.typography.fontWeight.bold,
  color: tokens.colors.text.primary
};

const mobileTitleStyle = {
  fontSize: tokens.typography.fontSize.lg
};

const tabletTitleStyle = {
  fontSize: tokens.typography.fontSize.xl
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: tokens.typography.fontSize.xl,
  cursor: 'pointer',
  color: tokens.colors.text.secondary,
  padding: tokens.spacing[1],
  borderRadius: tokens.borderRadius.sm,
  transition: 'all 0.2s ease'
};

const timerDisplayStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: tokens.spacing[8]
};

const progressContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: tokens.spacing[4]
};

const svgStyle = {
  position: 'absolute'
};

const timeDisplayStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1
};

const timeTextStyle = {
  fontSize: tokens.typography.fontSize.xl,
  fontWeight: tokens.typography.fontWeight.bold,
  color: tokens.colors.text.primary,
  margin: 0
};

const mobileTimeTextStyle = {
  fontSize: tokens.typography.fontSize.lg
};

const tabletTimeTextStyle = {
  fontSize: tokens.typography.fontSize.xl
};

const timeLabelStyle = {
  fontSize: tokens.typography.fontSize.sm,
  color: tokens.colors.text.secondary,
  margin: 0
};

const mobileTimeLabelStyle = {
  fontSize: tokens.typography.fontSize.xs
};

const tabletTimeLabelStyle = {
  fontSize: tokens.typography.fontSize.sm
};

const progressTextStyle = {
  fontSize: tokens.typography.fontSize.md,
  color: tokens.colors.text.secondary,
  margin: 0
};

const mobileProgressTextStyle = {
  fontSize: tokens.typography.fontSize.sm
};

const tabletProgressTextStyle = {
  fontSize: tokens.typography.fontSize.md
};



const controlsStyle = {
  display: 'flex',
  gap: tokens.spacing[3],
  justifyContent: 'center',
  marginTop: tokens.spacing[4],
  marginBottom: tokens.spacing[5],
  flexWrap: 'wrap'
};

const controlButtonStyle = {
  padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
  backgroundColor: tokens.colors.primary[500],
  color: 'white',
  border: 'none',
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.typography.fontSize.sm,
  fontWeight: tokens.typography.fontWeight.medium,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minWidth: '100px'
};

const darkControlButtonStyle = {
  backgroundColor: 'var(--color-primary-500)'
};

const mobileControlButtonStyle = {
  padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
  fontSize: tokens.typography.fontSize.md,
  minWidth: '120px'
};

const tabletControlButtonStyle = {
  padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
  fontSize: tokens.typography.fontSize.sm,
  minWidth: '110px'
};

const resetButtonStyle = {
  ...controlButtonStyle,
  backgroundColor: tokens.colors.gray[500],
  color: 'white'
};

const darkResetButtonStyle = {
  backgroundColor: 'var(--color-gray-500)'
};

const completeSectionStyle = {
  textAlign: 'center',
  marginBottom: tokens.spacing[5]
};

const completeTextStyle = {
  margin: `0 0 ${tokens.spacing[3]} 0`,
  fontSize: tokens.typography.fontSize.md,
  color: tokens.colors.success[600],
  fontWeight: tokens.typography.fontWeight.medium
};

const completeButtonStyle = {
  padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
  backgroundColor: tokens.colors.success[600],
  color: 'white',
  border: 'none',
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.typography.fontSize.md,
  fontWeight: tokens.typography.fontWeight.medium,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const darkCompleteButtonStyle = {
  backgroundColor: 'var(--color-success-600)'
};

const mobileCompleteButtonStyle = {
  padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
  fontSize: tokens.typography.fontSize.lg,
  width: '100%'
};

const tabletCompleteButtonStyle = {
  padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
  fontSize: tokens.typography.fontSize.md
};



export default TimerVerificationModal;
