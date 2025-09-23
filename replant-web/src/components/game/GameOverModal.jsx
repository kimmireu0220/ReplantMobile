import React from 'react';
import { tokens } from '../../design/tokens';

const overlayStyle = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: tokens.zIndex.modal,
};

const modalStyle = {
  width: '90%',
  maxWidth: 360,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: tokens.borderRadius.lg,
  boxShadow: tokens.shadow.lg,
  padding: tokens.spacing[6],
  textAlign: 'center',
};

const titleStyle = {
  fontSize: tokens.typography.fontSize['2xl'],
  fontWeight: tokens.typography.fontWeight.bold,
  color: tokens.colors.text.primary,
  marginBottom: tokens.spacing[4],
};

const subtitleStyle = {
  fontSize: tokens.typography.fontSize.base,
  color: tokens.colors.text.secondary,
  marginBottom: tokens.spacing[6],
};



const GameOverModal = ({ open, score = 0, onRestart, className = '' }) => {
  if (!open) return null;
  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="게임 오버">
      <div style={modalStyle} className={className}>
        <div style={titleStyle}>Game Over</div>
        <div style={subtitleStyle}>다시 시작</div>
      </div>
    </div>
  );
};

export default GameOverModal;


