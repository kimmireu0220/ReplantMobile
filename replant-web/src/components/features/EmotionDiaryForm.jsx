import React, { useState } from 'react';
import { tokens } from '../../design/tokens';
import Card from '../ui/Card';
import Button from '../ui/Button';
import EmotionTagList from '../ui/EmotionTagList';

const EmotionDiaryForm = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  className = '',
  asCard = true,
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState(
    initialData?.emotion_id ?? initialData?.emotion
  );
  const [content, setContent] = useState(initialData?.content || '');
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split('T')[0]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmotion || !content.trim()) return;

    onSubmit({
      emotion: selectedEmotion,
      content: content.trim(),
      date,
    });
  };

  const handleEmotionSelect = (emotionId) => {
    setSelectedEmotion(emotionId);
  };

  const isValid = selectedEmotion && content.trim().length > 0;

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[6],
  };

  const sectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[3],
  };

  const labelStyle = {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
  };

  const inputStyle = {
    width: '100%',
    height: tokens.components.input.height,
    padding: tokens.components.input.padding,
    borderRadius: tokens.components.input.borderRadius,
    border: `1px solid ${tokens.colors.border.light}`,
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.primary,
    backgroundColor: tokens.colors.background.primary,
    outline: 'none',
    transition: 'border-color 150ms ease',
  };

  const textareaStyle = {
    ...inputStyle,
    height: '120px',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: tokens.spacing[3],
    justifyContent: 'flex-end',
  };

  const Wrapper = asCard ? Card : 'div';

  return (
    <Wrapper {...(asCard ? { variant: 'default', padding: 'lg' } : {})} className={`replant-emotion-diary-form ${className}`}>
      <form onSubmit={handleSubmit} style={formStyle}>
        {/* Date Input */}
        <div style={sectionStyle}>
          <label style={labelStyle}>날짜</label>
          <input
            type="date"
            id="diary-date-input"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        {/* Emotion Selection */}
        <div style={sectionStyle}>
          <label style={labelStyle}>오늘의 감정</label>
          <EmotionTagList
            selectedEmotion={selectedEmotion}
            onSelect={handleEmotionSelect}
            size="md"
          />
        </div>

        {/* Content Input */}
        <div style={sectionStyle}>
          <label style={labelStyle}>일기 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘 하루는 어땠나요? 자유롭게 적어보세요..."
            style={textareaStyle}
            required
            maxLength={1000}
          />
          <div style={{
            textAlign: 'right',
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.text.tertiary,
          }}>
            {content.length}/1000
          </div>
        </div>

        {/* Buttons */}
        <div style={buttonContainerStyle}>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              size="base"
              onClick={onCancel}
              disabled={isLoading}
            >
              취소
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="base"
            disabled={!isValid}
            loading={isLoading}
          >
            {initialData ? '수정하기' : '저장하기'}
          </Button>
        </div>
      </form>
    </Wrapper>
  );
};

export default EmotionDiaryForm;