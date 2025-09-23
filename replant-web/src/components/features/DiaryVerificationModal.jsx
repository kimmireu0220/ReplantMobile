import React, { useState, useEffect } from 'react';
import { tokens } from '../../design/tokens';
import { useTheme } from '../../contexts/ThemeContext';
import { useDiaryVerification } from '../../hooks/useDiaryVerification';
import { useNotification } from '../../hooks/useNotification';

const DiaryVerificationModal = ({ 
  missionId, 
  onComplete, 
  onCancel 
}) => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  
  const {
    isChecking,
    error,
    screenSize,
    checkDiaryCompletion,
    completeMission,
    navigateToDiary
  } = useDiaryVerification();

  const { showError, showInfo } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  // 반응형 스타일 계산
  const isMobile = screenSize.isMobile;
  const isTablet = screenSize.isTablet;

  // 일기 완료 확인
  const handleCheckCompletion = async () => {
    try {
      setIsLoading(true);
      const isCompleted = await checkDiaryCompletion(missionId);
      
      if (isCompleted) {
        await completeMission(missionId);
        showInfo('미션 완료', '일기 작성이 완료되어 미션이 완료되었습니다! 🎉');
        onComplete?.();
      } else {
        showError('일기 미완성', '아직 일기를 작성하지 않았습니다. 일기를 작성한 후 다시 확인해주세요.');
      }
    } catch (error) {
      showError('확인 실패', '일기 완료 확인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 일기 페이지로 이동
  const handleNavigateToDiary = () => {
    navigateToDiary();
  };

  // 에러 처리
  useEffect(() => {
    if (error) {
      showError('오류 발생', error);
    }
  }, [error, showError]);

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
            📝 일기 작성하기
          </h2>
          <button 
            onClick={onCancel}
            style={closeButtonStyle}
            aria-label="모달 닫기"
          >
            ✕
          </button>
        </div>

        {/* 설명 */}
        <div style={descriptionStyle}>
          <p style={{
            ...descriptionTextStyle,
            ...(isMobile && mobileTextStyle),
            ...(isTablet && tabletTextStyle)
          }}>
            오늘의 생각과 감정을 일기로 작성해주세요.
          </p>
          <p style={{
            ...descriptionTextStyle,
            ...(isMobile && mobileTextStyle),
            ...(isTablet && tabletTextStyle),
            color: tokens.colors.text.secondary
          }}>
            일기 작성이 완료되면 미션이 자동으로 완료됩니다.
          </p>
        </div>

        {/* 안내 아이콘 */}
        <div style={iconContainerStyle}>
          <span style={iconStyle}>📖</span>
        </div>

        {/* 버튼 그룹 */}
        <div style={{
          ...buttonGroupStyle,
          ...(isMobile && mobileButtonGroupStyle),
          ...(isTablet && tabletButtonGroupStyle)
        }}>
          <button
            onClick={handleNavigateToDiary}
            style={{
              ...primaryButtonStyle,
              ...(isDark && darkPrimaryButtonStyle)
            }}
            disabled={isLoading}
          >
            📝 일기 작성하러 가기
          </button>
          
          <button
            onClick={handleCheckCompletion}
            style={{
              ...secondaryButtonStyle,
              ...(isDark && darkSecondaryButtonStyle)
            }}
            disabled={isLoading || isChecking}
          >
            {isLoading || isChecking ? '⏳ 확인 중...' : '✅ 완료 확인'}
          </button>
          
          <button
            onClick={onCancel}
            style={{
              ...cancelButtonStyle,
              ...(isDark && darkCancelButtonStyle)
            }}
            disabled={isLoading}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

// 기본 스타일
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
  color: tokens.colors.text.primary,
  borderRadius: tokens.borderRadius.lg,
  padding: `${tokens.spacing[8]} ${tokens.spacing[6]}`,
  maxWidth: '700px',
  width: '100%',
  maxHeight: '80vh',
  overflow: 'auto',
  boxShadow: tokens.shadow.xl,
  border: `1px solid ${tokens.colors.border.light}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: tokens.spacing[6],
  paddingBottom: tokens.spacing[4],
  borderBottom: `2px solid ${tokens.colors.border.light}`
};

const titleStyle = {
  margin: 0,
  fontSize: tokens.typography.fontSize['3xl'],
  fontWeight: tokens.typography.fontWeight.bold,
  color: tokens.colors.text.primary
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: tokens.colors.text.secondary,
  padding: tokens.spacing[1],
  borderRadius: tokens.borderRadius.md,
  transition: 'all 0.2s ease'
};

const descriptionStyle = {
  marginBottom: tokens.spacing[6]
};

const descriptionTextStyle = {
  fontSize: tokens.typography.fontSize.lg,
  lineHeight: tokens.typography.lineHeight.relaxed,
  color: tokens.colors.text.primary,
  marginBottom: tokens.spacing[3]
};

const iconContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: tokens.spacing[6]
};

const iconStyle = {
  fontSize: '64px',
  filter: 'grayscale(0.2)'
};

const buttonGroupStyle = {
  display: 'flex',
  gap: tokens.spacing[3],
  flexDirection: 'row',
  justifyContent: 'center'
};

const primaryButtonStyle = {
  padding: `${tokens.spacing[3]} ${tokens.spacing[5]}`,
  backgroundColor: tokens.colors.primary[500],
  color: tokens.colors.text.inverse,
  border: 'none',
  borderRadius: tokens.borderRadius.lg,
  fontSize: tokens.typography.fontSize.md,
  fontWeight: tokens.typography.fontWeight.medium,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minHeight: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.spacing[2]
};

const secondaryButtonStyle = {
  padding: `${tokens.spacing[3]} ${tokens.spacing[5]}`,
  backgroundColor: tokens.colors.background.secondary,
  color: tokens.colors.text.primary,
  border: `1px solid ${tokens.colors.border.light}`,
  borderRadius: tokens.borderRadius.lg,
  fontSize: tokens.typography.fontSize.md,
  fontWeight: tokens.typography.fontWeight.medium,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minHeight: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.spacing[2]
};

const cancelButtonStyle = {
  padding: `${tokens.spacing[3]} ${tokens.spacing[5]}`,
  backgroundColor: 'transparent',
  color: tokens.colors.text.secondary,
  border: `1px solid ${tokens.colors.border.light}`,
  borderRadius: tokens.borderRadius.lg,
  fontSize: tokens.typography.fontSize.md,
  fontWeight: tokens.typography.fontWeight.medium,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minHeight: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

// 다크모드 스타일
const darkModeStyles = {
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.6)',
  background: `linear-gradient(145deg, ${tokens.colors.background.primary} 0%, ${tokens.colors.background.secondary} 100%)`,
  border: `1px solid ${tokens.colors.border.medium}`
};

const darkPrimaryButtonStyle = {
  backgroundColor: tokens.colors.primary[600],
  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
};

const darkSecondaryButtonStyle = {
  backgroundColor: tokens.colors.background.tertiary,
  borderColor: tokens.colors.border.medium
};

const darkCancelButtonStyle = {
  borderColor: tokens.colors.border.medium,
  color: tokens.colors.text.secondary
};

// 모바일 스타일
const mobileContainerStyle = {
  padding: `${tokens.spacing[4]} ${tokens.spacing[3]}`,
  maxWidth: '95vw',
  maxHeight: '90vh'
};

const mobileTitleStyle = {
  fontSize: tokens.typography.fontSize.xl
};

const mobileTextStyle = {
  fontSize: tokens.typography.fontSize.sm,
  lineHeight: tokens.typography.lineHeight.relaxed
};

const mobileButtonGroupStyle = {
  flexDirection: 'column',
  gap: tokens.spacing[2]
};

// 태블릿 스타일
const tabletContainerStyle = {
  padding: `${tokens.spacing[6]} ${tokens.spacing[5]}`,
  maxWidth: '600px',
  maxHeight: '80vh'
};

const tabletTitleStyle = {
  fontSize: tokens.typography.fontSize['2xl']
};

const tabletTextStyle = {
  fontSize: tokens.typography.fontSize.base,
  lineHeight: tokens.typography.lineHeight.normal
};

const tabletButtonGroupStyle = {
  flexDirection: 'row',
  gap: tokens.spacing[3]
};

export default DiaryVerificationModal;
