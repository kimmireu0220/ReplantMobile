import React, { useState, useEffect, useRef, useCallback } from 'react';
import { tokens } from '../../design/tokens';
import { validateNickname, getCurrentUserNickname, checkNicknameDuplicate } from '../../config/supabase';
import { userService } from '../../services';

const NicknameEditModal = ({ isOpen, onClose, onSuccess, onError }) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentNickname, setCurrentNickname] = useState('');
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateStatus, setDuplicateStatus] = useState(''); // 'available', 'duplicate', 'error', ''
  const inputRef = useRef(null);
  const checkTimeoutRef = useRef(null);

  // Debounced 닉네임 중복 확인
  const checkNicknameDuplication = useCallback(async (nicknameToCheck) => {
    // 현재 닉네임과 같으면 확인하지 않음
    if (nicknameToCheck === currentNickname) {
      setDuplicateStatus('');
      return;
    }

    // 유효성 검사 먼저 수행
    const validation = validateNickname(nicknameToCheck);
    if (!validation.isValid) {
      setDuplicateStatus('');
      return;
    }

    setIsCheckingDuplicate(true);
    setDuplicateStatus('');

    try {
      const isDuplicate = await checkNicknameDuplicate(nicknameToCheck);
      if (isDuplicate) {
        setDuplicateStatus('duplicate');
        setError('이미 사용 중인 닉네임입니다.');
      } else {
        setDuplicateStatus('available');
        setError('');
      }
    } catch (error) {
      setDuplicateStatus('error');
    } finally {
      setIsCheckingDuplicate(false);
    }
  }, [currentNickname]);

  // 닉네임 입력 변경 핸들러 (debounced)
  const handleNicknameChange = useCallback((value) => {
    setNickname(value);
    setError('');
    setDuplicateStatus('');

    // 이전 타이머 클리어
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // 빈 값이거나 현재 닉네임과 같으면 중복 확인하지 않음
    if (!value.trim() || value === currentNickname) {
      setDuplicateStatus('');
      return;
    }

    // 기본 유효성 검사
    const validation = validateNickname(value);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    // 1초 후에 중복 확인 실행
    checkTimeoutRef.current = setTimeout(() => {
      checkNicknameDuplication(value);
    }, 1000);
  }, [currentNickname, checkNicknameDuplication]);

  // handleClose를 useCallback으로 정의 (useEffect에서 사용하기 위해)
  const handleClose = useCallback(() => {
    if (!isLoading && !isCheckingDuplicate) {
      // 타이머 정리
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      
      setNickname('');
      setError('');
      setDuplicateStatus('');
      onClose();
    }
  }, [isLoading, isCheckingDuplicate, onClose]);

  // 모달이 열릴 때 현재 닉네임 로드
  useEffect(() => {
    if (isOpen) {
      const current = getCurrentUserNickname() || '';
      setCurrentNickname(current);
      setNickname(current);
      setError('');
      setDuplicateStatus('');
      
      // 포커스 설정 (약간의 지연을 두어 모달이 완전히 렌더링된 후 포커스)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 150);
    }
  }, [isOpen]);

  // ESC 키 핸들링
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 배경 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  // Cleanup: 타이머 정리
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading || isCheckingDuplicate) return;

    // 유효성 검증
    const validation = validateNickname(nickname);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    // 현재 닉네임과 같은지 확인
    if (nickname === currentNickname) {
      setError('현재 닉네임과 동일합니다.');
      return;
    }

    // 중복 검증은 네트워크 지연에 영향받을 수 있으므로 서버에서 최종 검증하도록 위임
    // 클라이언트에서는 duplicate 상태일 때만 막고, 그 외에는 서버 결과를 신뢰
    if (duplicateStatus === 'duplicate') {
      setError('이미 사용 중인 닉네임입니다.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await userService.updateUserNickname(nickname);
      
      if (result.success) {
        // 성공 콜백 호출
        if (onSuccess) {
          onSuccess(result.data.newNickname, result.data.oldNickname);
        }
        handleClose();
      } else {
        const errorMessage = result.error || '닉네임 변경에 실패했습니다.';
        setError(errorMessage);
        // 에러 콜백 호출
        if (onError) {
          onError(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = '닉네임 변경 중 오류가 발생했습니다.';
      setError(errorMessage);
      // 에러 콜백 호출
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.colors.background.overlay,
    zIndex: tokens.zIndex.modal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing[4],
  };

  const modalStyle = {
    backgroundColor: tokens.colors.background.primary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[6],
    maxWidth: '400px',
    width: '100%',
    boxShadow: tokens.shadow.lg,
    border: `1px solid ${tokens.colors.border.light}`,
    position: 'relative',
  };

  const headerStyle = {
    marginBottom: tokens.spacing[6],
    textAlign: 'center',
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    margin: 0,
    marginBottom: tokens.spacing[2],
  };

  const subtitleStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    margin: 0,
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[4],
  };

  const labelStyle = {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.primary,
    display: 'block',
    marginBottom: tokens.spacing[2],
  };

  const inputStyle = {
    width: '100%',
    padding: tokens.spacing[3],
    border: `1px solid ${error ? tokens.colors.error : tokens.colors.border.light}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.primary,
    backgroundColor: tokens.colors.background.primary,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      borderColor: error ? tokens.colors.error : tokens.colors.primary,
    },
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: tokens.spacing[3],
    marginTop: tokens.spacing[2],
  };

  const buttonBaseStyle = {
    flex: 1,
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  };

  const cancelButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: tokens.colors.background.secondary,
    color: tokens.colors.text.secondary,
    border: `1px solid ${tokens.colors.border.light}`,
  };

  // 제출 버튼 활성/비활성 상태를 한 곳에서 계산해 재사용
  const hasNicknameInput = nickname.trim().length > 0;
  const isSameNickname = nickname === currentNickname;
  const isAvailable = duplicateStatus === 'available';
  const isSubmitDisabled = (
    isLoading ||
    isCheckingDuplicate ||
    !hasNicknameInput ||
    isSameNickname ||
    !isAvailable
  );

  const submitButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: isSubmitDisabled ? tokens.colors.gray[200] : tokens.colors.primary[600],
    color: isSubmitDisabled ? tokens.colors.text.secondary : tokens.colors.text.inverse,
    cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.7 : 1,
    border: isSubmitDisabled ? `1px solid ${tokens.colors.border.light}` : 'none',
  };


  const characterCountStyle = {
    fontSize: tokens.typography.fontSize.xs,
    color: nickname.length > 15 ? tokens.colors.warning : tokens.colors.text.tertiary,
    textAlign: 'right',
    marginTop: tokens.spacing[1],
  };

  const statusIndicatorStyle = {
    fontSize: tokens.typography.fontSize.xs,
    marginTop: tokens.spacing[1],
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[1],
  };

  const getStatusColor = () => {
    if (error) {
      return tokens.colors.error;
    }
    switch (duplicateStatus) {
      case 'available':
        return tokens.colors.success || '#22c55e';
      case 'duplicate':
        return tokens.colors.error;
      case 'error':
        return tokens.colors.warning;
      default:
        return tokens.colors.text.tertiary;
    }
  };

  const getStatusMessage = () => {
    if (isCheckingDuplicate) {
      return '중복 확인 중...';
    }
    if (error) {
      return error;
    }
    switch (duplicateStatus) {
      case 'available':
        return '사용 가능한 닉네임입니다';
      case 'duplicate':
        return '이미 사용 중인 닉네임입니다';
      case 'error':
        return '중복 확인 중 오류가 발생했습니다';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    if (isCheckingDuplicate) {
      return '⏳';
    }
    if (error) {
      return '❌';
    }
    switch (duplicateStatus) {
      case 'available':
        return '✅';
      case 'duplicate':
        return '❌';
      case 'error':
        return '⚠️';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="nickname-modal-title">
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 id="nickname-modal-title" style={titleStyle}>닉네임 변경</h2>
          <p style={subtitleStyle}>새로운 닉네임을 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label htmlFor="nickname-input" style={labelStyle}>
              닉네임
            </label>
            <input
              id="nickname-input"
              ref={inputRef}
              type="text"
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              style={inputStyle}
              placeholder="새로운 닉네임을 입력하세요"
              maxLength={20}
              disabled={isLoading}
              autoComplete="off"
              onFocus={(e) => e.target.style.borderColor = error ? tokens.colors.error : tokens.colors.primary}
              onBlur={(e) => e.target.style.borderColor = error ? tokens.colors.error : tokens.colors.border.light}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: tokens.spacing[1],
            }}>
              <div style={{
                ...statusIndicatorStyle,
                color: getStatusColor(),
                flex: 1,
              }}>
                {(isCheckingDuplicate || duplicateStatus || error) && (
                  <>
                    <span>{getStatusIcon()}</span>
                    <span>{getStatusMessage()}</span>
                  </>
                )}
              </div>
              <div style={characterCountStyle}>
                {nickname.length}/20
              </div>
            </div>
          </div>

          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={handleClose}
              style={cancelButtonStyle}
              disabled={isLoading}
              onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = tokens.colors.background.tertiary)}
              onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = tokens.colors.background.secondary)}
            >
              취소
            </button>
            <button
              type="submit"
              style={submitButtonStyle}
              disabled={isSubmitDisabled}
              onMouseOver={(e) => {
                if (!isSubmitDisabled) {
                  e.target.style.opacity = '0.9';
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitDisabled) {
                  e.target.style.opacity = '1';
                }
              }}
            >
              변경하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NicknameEditModal;