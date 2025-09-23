import React, { useState, useCallback } from 'react';
import { tokens } from '../../design/tokens';

const CharacterNameEdit = ({ 
  character, 
  onNameChange, 
  isEditing, 
  onEditToggle,
  onSave,
  onCancel,
  onRestoreDefault 
}) => {
  // 기본값 표시 함수 (빈 문자열이나 null인 경우 기본값 사용)
  const getDisplayName = useCallback((char) => {
    if (!char) return '알 수 없음';
    return (char.name && char.name.trim() !== '') ? char.name : (char.title || '알 수 없음');
  }, []);

  const [editName, setEditName] = useState(getDisplayName(character));
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // 유효성 검사
  const validateName = useCallback((name) => {
    if (!name || name.trim().length === 0) return false;
    if (name.length > 20) return false;
    return true;
  }, []);

  // 변경사항 확인
  const hasChanges = editName !== getDisplayName(character);

  // 저장/취소 핸들러
  const handleAction = useCallback(async () => {
    if (hasChanges) {
      // 변경사항이 있으면 저장
      if (!validateName(editName)) return;
      
      setIsSaving(true);
      try {
        await onSave(editName.trim());
        onEditToggle(false);
      } catch (error) {
        // Error handled by UI
      } finally {
        setIsSaving(false);
      }
    } else {
      // 변경사항이 없으면 취소
      setEditName(getDisplayName(character));
      onEditToggle(false);
      onCancel?.();
    }
  }, [editName, hasChanges, onSave, onEditToggle, onCancel, validateName, character, getDisplayName]);

  // 기본값 복원 핸들러
  const handleRestoreDefault = useCallback(async () => {
    setIsRestoring(true);
    try {
      await onRestoreDefault();
      onEditToggle(false);
    } catch (error) {
      // Error handled by UI
    } finally {
      setIsRestoring(false);
    }
  }, [onRestoreDefault, onEditToggle]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAction();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditName(getDisplayName(character));
      onEditToggle(false);
      onCancel?.();
    }
  }, [handleAction, character, onEditToggle, onCancel, getDisplayName]);

  // 편집 모드 스타일 (한 줄로, 중앙 정렬)
  const editContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[4], // 이름 입력 칸과 버튼 사이 간격을 16px로 늘림
    padding: tokens.spacing[2],
    justifyContent: 'center'
  };

  const inputStyle = {
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    border: `1px solid ${validateName(editName) ? tokens.colors.primary[300] : tokens.colors.error[300]}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.xl, // 폰트 크기 축소: 2xl → xl
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    backgroundColor: tokens.colors.background.primary,
    outline: 'none',
    minWidth: '150px',
    textAlign: 'center'
  };

  const buttonStyle = () => ({
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    border: 'none',
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
    cursor: isSaving ? 'not-allowed' : 'pointer',
    opacity: isSaving ? 0.7 : 1,
    backgroundColor: hasChanges ? tokens.colors.primary[500] : tokens.colors.gray[200],
    color: hasChanges ? tokens.colors.text.inverse : tokens.colors.text.secondary,
    minWidth: '60px',
    minHeight: '44px' // 입력 필드와 비슷한 높이
  });

  const restoreButtonStyle = () => ({
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    border: 'none',
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold,
    cursor: isRestoring ? 'not-allowed' : 'pointer',
    opacity: isRestoring ? 0.7 : 1,
    backgroundColor: tokens.colors.warning,
    color: tokens.colors.text.inverse,
    minWidth: '80px',
    minHeight: '44px'
  });

  if (!isEditing) {
    return (
      <div style={{ 
        textAlign: 'center', 
        cursor: 'pointer',
        padding: tokens.spacing[2], // 편집 모드와 동일한 패딩
        borderRadius: tokens.borderRadius.md,
        transition: 'all 0.2s ease',
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tokens.spacing[2]
      }} 
      onClick={() => onEditToggle(true)}

      >
        <span style={{
          fontSize: tokens.typography.fontSize['2xl'],
          fontWeight: tokens.typography.fontWeight.bold,
          color: tokens.colors.text.primary
        }}>
          {getDisplayName(character)}
        </span>
        <span style={{
          fontSize: tokens.typography.fontSize.base,
          color: tokens.colors.primary[500]
        }}>
          ✏️
        </span>
      </div>
    );
  }

  return (
    <div style={editContainerStyle}>
      <input
        type="text"
        id="character-name-input"
        name="characterName"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        onKeyDown={handleKeyDown}
        style={inputStyle}
        placeholder="캐릭터 이름을 입력하세요"
        maxLength={20}
        disabled={isSaving}
        autoFocus
      />
      <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
        <button
          onClick={handleAction}
          disabled={isSaving || isRestoring || (hasChanges && !validateName(editName))}
          style={buttonStyle()}
        >
          {isSaving ? '저장 중...' : (hasChanges ? '저장' : '취소')}
        </button>
        {/* 사용자가 커스텀 이름을 설정한 경우에만 기본값 복원 버튼 표시 */}
        {character.name && character.name.trim() !== '' && (
          <button
            onClick={handleRestoreDefault}
            disabled={isSaving || isRestoring}
            style={restoreButtonStyle()}
          >
            {isRestoring ? '복원 중...' : '기본값 복원'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CharacterNameEdit; 