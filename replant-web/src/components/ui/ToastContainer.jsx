import React from 'react';
import Toast from './Toast';
import { tokens } from '../../design/tokens';

const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  const containerStyle = {
    position: 'fixed',
    top: tokens.spacing[4],
    right: tokens.spacing[4],
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[2],
    pointerEvents: 'none' // 컨테이너는 클릭 이벤트를 차단하지 않음
  };

  return (
    <div style={containerStyle}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            visible={toast.visible}
            onClose={() => removeToast(toast.id)}
            onClick={toast.onClick}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;