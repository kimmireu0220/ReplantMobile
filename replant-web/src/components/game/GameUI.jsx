import React from 'react';
import { tokens } from '../../design/tokens';

const hudBoxStyle = {
  backgroundColor: 'rgba(255,255,255,0.75)',
  border: `1px solid ${tokens.colors.border.light}`,
  borderRadius: tokens.borderRadius.lg,
  padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
  boxShadow: tokens.shadow.base,
  backdropFilter: 'blur(6px)'
};

const GameUI = ({ score = 0, distance = 0, lives = 3, className = '' }) => {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
      aria-hidden
    >
      {/* 좌상단: 점수/거리 */}
      <div style={{ position: 'absolute', top: 8, left: 8, ...hudBoxStyle }}>
        <div style={{ color: tokens.colors.text.primary, fontWeight: tokens.typography.fontWeight.semibold }}>
          점수: {score}
        </div>
        <div style={{ color: tokens.colors.text.secondary, fontSize: tokens.typography.fontSize.sm }}>
          거리: {distance} px
        </div>
      </div>

      {/* 우상단: 생명 */}
      <div style={{ position: 'absolute', top: 8, right: 8, ...hudBoxStyle }}>
        <div
          style={{
            color: tokens.colors.error,
            fontSize: tokens.typography.fontSize.base,
            fontWeight: tokens.typography.fontWeight.semibold,
            minWidth: 80,
            textAlign: 'right',
          }}
        >
          {'❤'.repeat(Math.max(0, lives))}
        </div>
      </div>
    </div>
  );
};

export default GameUI;


