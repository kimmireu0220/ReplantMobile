import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../design/tokens';
import { Button } from '../components/ui';
import { PageTitle, ScreenReaderOnly } from '../components/ui/ScreenReaderOnly';
import { generateTemporaryNickname } from '../config/supabase';
import { useSupabase } from '../contexts/SupabaseContext';
import { handleSupabaseError } from '../utils/ErrorHandler';

const NicknamePage = () => {
  const navigate = useNavigate();
  const { checkNicknameDuplicate, createUserWithNickname } = useSupabase();
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const handleGenerateNickname = () => {
    const tempNickname = generateTemporaryNickname();
    setNickname(tempNickname);
    setNicknameError('');
  };

  const validateNickname = async (nickname) => {
    try {
      // 클라이언트 사이드 유효성 검사
      if (!nickname || nickname.trim().length === 0) {
        return { isValid: false, message: '닉네임을 입력해주세요.' };
      }
      
      if (nickname.length < 2) {
        return { isValid: false, message: '닉네임은 2자 이상이어야 합니다.' };
      }
      
      if (nickname.length > 20) {
        return { isValid: false, message: '닉네임은 20자 이하여야 합니다.' };
      }
      
      // 특수문자 제한 (한글, 영문, 숫자만 허용)
      const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;
      if (!nicknameRegex.test(nickname)) {
        return { isValid: false, message: '닉네임은 한글, 영문, 숫자만 사용 가능합니다.' };
      }
      
      return { isValid: true, message: '' };
    } catch (error) {
      return { isValid: false, message: '닉네임 확인 중 오류가 발생했습니다.' };
    }
  };

  const handleCreateUser = useCallback(async () => {
    setIsCreatingUser(true);
    
    try {
      const validation = await validateNickname(nickname);
      if (!validation.isValid) {
        setNicknameError(validation.message);
        return;
      }

      const { data: isDuplicate, error: duplicateError } = await checkNicknameDuplicate(nickname);

      if (duplicateError) {
        throw duplicateError;
      }

      if (isDuplicate) {
        setNicknameError('이미 사용 중인 닉네임입니다.');
        return;
      }

      const { data: newUserId, error: createError } = await createUserWithNickname(nickname);

      if (createError) {
        throw createError;
      }

      localStorage.setItem('userNickname', nickname);
      localStorage.setItem('userId', newUserId);

      navigate('/home', { replace: true });
    } catch (error) {
      const processedError = handleSupabaseError(error, '사용자 생성');
      setNicknameError(processedError.message);
    } finally {
      setIsCreatingUser(false);
    }
  }, [nickname, navigate, checkNicknameDuplicate, createUserWithNickname]); // context에서 제공되는 안정적인 함수들 포함

  const handleCheckDuplicate = useCallback(async () => {
    const validation = await validateNickname(nickname);
    if (!validation.isValid) {
      setNicknameError(validation.message);
      return;
    }

    setIsCheckingDuplicate(true);
    setNicknameError('');

    try {
      const { data: isDuplicate, error } = await checkNicknameDuplicate(nickname);

      if (error) {
        throw error;
      }

      if (isDuplicate) {
        setNicknameError('이미 사용 중인 닉네임입니다.');
      } else {
        setNicknameError('');
        handleCreateUser();
      }
    } catch (error) {
      const processedError = handleSupabaseError(error, '닉네임 중복 확인');
      setNicknameError(processedError.message);
    } finally {
      setIsCheckingDuplicate(false);
    }
  }, [nickname, handleCreateUser, checkNicknameDuplicate]); // context에서 제공되는 안정적인 함수 포함

  const handleSubmit = useCallback(() => {
    if (nickname.trim()) {
      handleCheckDuplicate();
    } else {
      setNicknameError('닉네임을 입력해주세요.');
    }
  }, [nickname, handleCheckDuplicate]);

  // 키보드 네비게이션 지원
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  // 페이지 스타일
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.background.primary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing[4],
    position: 'relative'
  };

  const contentStyle = {
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center'
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2],
    lineHeight: tokens.typography.lineHeight.tight
  };

  const subtitleStyle = {
    fontSize: tokens.typography.fontSize.lg,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[8],
    lineHeight: tokens.typography.lineHeight.relaxed
  };

  const inputContainerStyle = {
    position: 'relative',
    width: '100%',
    marginBottom: tokens.spacing[6]
  };

  const generateButtonStyle = {
    position: 'absolute',
    right: tokens.spacing[2],
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: tokens.colors.text.secondary,
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    borderRadius: tokens.borderRadius.sm,
    fontSize: tokens.typography.fontSize.sm,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[1],
    whiteSpace: 'nowrap',
    zIndex: 1
  };

  const nicknameInputStyle = {
    width: '100%',
    padding: `${tokens.spacing[4]} ${tokens.spacing[16]} ${tokens.spacing[4]} ${tokens.spacing[4]}`,
    fontSize: tokens.typography.fontSize.lg,
    border: `2px solid ${nicknameError ? tokens.colors.error[500] : tokens.colors.border.light}`,
    borderRadius: tokens.borderRadius.lg,
    backgroundColor: tokens.colors.background.secondary,
    color: tokens.colors.text.primary,
    transition: 'all 0.2s ease',
    outline: 'none',
    textAlign: 'left',
    fontWeight: tokens.typography.fontWeight.medium
  };

  const errorTextStyle = {
    color: tokens.colors.error[500],
    fontSize: tokens.typography.fontSize.sm,
    marginTop: tokens.spacing[2],
    marginBottom: tokens.spacing[4],
    minHeight: '20px',
    textAlign: 'center'
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[3],
    marginTop: tokens.spacing[6]
  };

  return (
    <div 
      style={pageStyle}
      role="main"
      aria-label="닉네임 설정"
    >
      <PageTitle title="닉네임 설정" />
      <div style={contentStyle}>
        <h1 
          style={titleStyle}
          id="nickname-title"
        >
          👤 닉네임을 설정해주세요
        </h1>

        <p 
          style={subtitleStyle}
          id="nickname-description"
        >
          나만의 특별한 닉네임으로 Replant를 시작해보세요.
        </p>

        <div style={inputContainerStyle}>
          <label htmlFor="nickname-input">
            <ScreenReaderOnly>닉네임</ScreenReaderOnly>
          </label>
          <input
            type="text"
            id="nickname-input"
            name="nickname"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setNicknameError('');
            }}
            placeholder="닉네임을 입력하세요 (2-20자)"
            style={nicknameInputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = tokens.colors.accent.blue;
              e.target.style.boxShadow = `0 0 0 3px ${tokens.colors.accent.blue}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = nicknameError ? tokens.colors.error[500] : tokens.colors.border.light;
              e.target.style.boxShadow = 'none';
            }}
            onKeyPress={handleKeyPress}
            maxLength={20}
            aria-describedby="nickname-error"
            aria-invalid={!!nicknameError}
          />
          
          <button
            style={generateButtonStyle}
            onClick={handleGenerateNickname}
            aria-label="자동으로 닉네임 생성"
          >
            🎲 자동 생성
          </button>
        </div>
        
        {nicknameError && (
          <div 
            style={errorTextStyle}
            id="nickname-error"
            role="alert"
          >
            {nicknameError}
          </div>
        )}

        <div style={buttonContainerStyle}>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={isCheckingDuplicate || isCreatingUser}
            style={{
              backgroundColor: tokens.colors.accent.blue,
              borderColor: tokens.colors.accent.blue,
              boxShadow: `0 4px 12px ${tokens.colors.accent.blue}40`,
              transition: 'all 0.15s ease',
              opacity: (isCheckingDuplicate || isCreatingUser) ? 0.7 : 1
            }}
            aria-describedby="nickname-description"
          >
            {isCheckingDuplicate ? '확인 중...' : 
             isCreatingUser ? '생성 중...' : '시작하기'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NicknamePage; 