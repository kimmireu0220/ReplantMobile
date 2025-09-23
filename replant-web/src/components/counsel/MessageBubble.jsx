import React, { useState } from 'react';
import { tokens } from '../../design/tokens';
import { useCharacter } from '../../hooks/useCharacter';
import { getCharacterImageUrl } from '../../utils/characterImageUtils';

const MessageBubble = ({
  message,
  isUser = false,
  timestamp,
  className = '',
  providerType = 'chatbot', // 상담사/챗봇 구분을 위한 prop 추가
}) => {
  const { selectedCharacter } = useCharacter();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // 레벨별 이미지 URL 생성 (Supabase 스토리지 기반)
  const getCharacterImage = (level) => {
    return getCharacterImageUrl(level, 'default');
  };

  // 이미지 로딩 핸들러
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const bubbleContainerStyle = {
    display: 'flex',
    flexDirection: isUser ? 'row-reverse' : 'row',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing[3],
    padding: `0 ${tokens.spacing[4]}`,
  };

  const messageWrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: isUser ? 'flex-end' : 'flex-start',
    maxWidth: '80%',
    flex: 1,
  };

  const bubbleStyle = {
    padding: tokens.spacing[3],
    borderRadius: tokens.borderRadius.lg,
    fontSize: tokens.typography.fontSize.sm,
    lineHeight: tokens.typography.lineHeight.relaxed,
    wordWrap: 'break-word',
    width: 'fit-content',
    maxWidth: '100%',
    ...(isUser ? {
      backgroundColor: tokens.colors.primary[500],
      color: tokens.colors.text.inverse,
      borderBottomRightRadius: tokens.borderRadius.sm,
    } : {
      backgroundColor: tokens.colors.gray[100],
      color: tokens.colors.text.primary,
      borderBottomLeftRadius: tokens.borderRadius.sm,
    }),
  };

  const timestampStyle = {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.tertiary,
    marginTop: tokens.spacing[1],
    alignSelf: isUser ? 'flex-end' : 'flex-start',
  };

  const avatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: tokens.borderRadius.full,
    backgroundColor: isUser ? tokens.colors.gray[100] : tokens.colors.gray[300],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px', // 아이콘 크기 증가 (기존 sm에서 24px로)
    flexShrink: 0,
    marginLeft: isUser ? tokens.spacing[2] : 0,
    marginRight: isUser ? 0 : tokens.spacing[2],
    overflow: 'hidden',
  };

  const avatarImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: imageLoading ? 0.5 : 1,
    transition: 'opacity 0.15s ease'
  };

  // 사용자 아바타 결정
  const getUserAvatar = () => {
    if (isUser && selectedCharacter) {
      const characterLevel = selectedCharacter.level || 1;
      // 레벨 6 이상이면 레벨 6 이미지 사용
      const maxLevel = 6;
      const actualLevel = Math.min(characterLevel, maxLevel);
      const characterImageUrl = getCharacterImage(actualLevel);
      
      if (characterImageUrl && !imageError) {
        return (
          <img 
            src={characterImageUrl} 
            alt={selectedCharacter.categoryInfo?.name || '캐릭터'}
            style={avatarImageStyle}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        );
      }
    }
    return null;
  };

  // 기본 아바타 (이모지) - 상담사와 챗봇 구분
  const getDefaultAvatar = () => {
    if (isUser) {
      return '👤'; // 사용자
    } else {
      // 상담사와 챗봇 구분
      return providerType === 'counselor' ? '👨‍⚕️' : '🤖';
    }
  };

  return (
    <div style={bubbleContainerStyle} className={className}>
      <div style={avatarStyle}>
        {getUserAvatar()}
        <div style={{ 
          display: (isUser && selectedCharacter && !imageError) ? 'none' : 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {getDefaultAvatar()}
        </div>
      </div>
      <div style={messageWrapperStyle}>
        <div style={bubbleStyle}>
          {message}
        </div>
        {timestamp && (
          <div style={timestampStyle}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;