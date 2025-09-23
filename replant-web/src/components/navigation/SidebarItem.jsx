import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { tokens } from '../../design/tokens';

const SidebarItem = ({ to, icon, text, onClick, className = '', disabled = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minHeight: '48px',
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
    textDecoration: 'none',
    color: isActive ? tokens.colors.primary[600] : tokens.colors.text.primary,
    backgroundColor: isActive ? tokens.colors.primary[50] : 'transparent',
    borderRadius: tokens.borderRadius.lg,
    transition: `all ${tokens.animation.normal} ease`,
    fontSize: tokens.typography.fontSize.base,
    fontWeight: isActive ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    outline: '2px solid transparent', // 일관된 아웃라인 크기 설정
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  };

  const iconStyle = {
    fontSize: '20px',
    marginRight: tokens.spacing[3],
    minWidth: '20px',
    textAlign: 'center',
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <NavLink
      to={to}
      style={itemStyle}
      className={`sidebar-item ${className}`}
      onClick={handleClick}
      aria-label={text}
      tabIndex={disabled ? -1 : 0}
      {...(disabled && { 'aria-disabled': true })}
    >
      <span style={iconStyle} aria-hidden="true">
        {icon}
      </span>
      <span>{text}</span>
    </NavLink>
  );
};

export default SidebarItem;