import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../design/tokens';
import { Button } from '../components/ui';
import { PageTitle, ScreenReaderOnly } from '../components/ui/ScreenReaderOnly';
import { supabase } from '../config/supabase';

const StartPage = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const inputRef = useRef(null);

  const validateNickname = async (nickname) => {
    try {
      const { data: validation, error } = await supabase.rpc('validate_nickname', { 
        nickname_param: nickname 
      });
      
      if (error) throw error;
      
      return validation;
    } catch (error) {
      return { isValid: false, message: '닉네임 확인 중 오류가 발생했습니다.' };
    }
  };

  const handleStart = useCallback(async () => {
    const validation = await validateNickname(nickname);
    if (!validation.isValid) {
      setNicknameError(validation.message);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      return;
    }

    setIsCheckingUser(true);
    setNicknameError('');

    try {
      const { data: userId, error } = await supabase.rpc('get_user_by_nickname', { 
        nickname_param: nickname 
      });

      if (error) {
        throw error;
      }

      if (userId) {
        localStorage.setItem('userNickname', nickname);
        localStorage.setItem('userId', userId);
        navigate('/home', { replace: true });
      } else {
        setNicknameError('존재하지 않는 닉네임입니다. 닉네임을 새로 생성해보세요.');
      }
    } catch (error) {
      setNicknameError('사용자 확인 중 오류가 발생했습니다.');
    } finally {
      setIsCheckingUser(false);
    }
  }, [nickname, navigate]);

  const handleSubmit = useCallback(() => {
    if (nickname.trim()) {
      handleStart();
    } else {
      setNicknameError('닉네임을 입력해주세요.');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [nickname, handleStart]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

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
    ...tokens.typography.textStyles.heading,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[8],
  };

  const inputContainerStyle = {
    position: 'relative',
    width: '100%',
    marginBottom: tokens.spacing[6]
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
      aria-label="닉네임 시작"
    >
      <PageTitle title="시작하기" />
      <div style={contentStyle}>
        <h1 
          style={titleStyle}
          id="start-title"
        >
          🎮 닉네임으로 시작하기
        </h1>

        <div style={inputContainerStyle}>
          <input
            ref={inputRef}
            type="text"
            id="start-nickname-input"
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
            aria-describedby="start-error"
            aria-invalid={!!nicknameError}
          />
        </div>
        
        {nicknameError && (
          <div 
            style={errorTextStyle}
            id="start-error"
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
            disabled={!nickname || isCheckingUser}
            aria-describedby="start-help"
            style={{
              backgroundColor: tokens.colors.accent.blue,
              borderColor: tokens.colors.accent.blue,
              boxShadow: `0 4px 12px ${tokens.colors.accent.blue}40`,
              transition: 'all 0.15s ease',
              opacity: (!nickname || isCheckingUser) ? 0.7 : 1
            }}

          >
            {isCheckingUser ? '확인 중...' : '시작하기'}
          </Button>
          <ScreenReaderOnly id="start-help">
            닉네임을 입력한 뒤 시작하기를 누르면 홈으로 이동합니다.
          </ScreenReaderOnly>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/nickname')}
            style={{
              backgroundColor: tokens.colors.background.secondary,
              color: tokens.colors.text.primary,
              borderColor: tokens.colors.border.light,
              marginTop: tokens.spacing[2]
            }}
          >
            닉네임 생성
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartPage; 