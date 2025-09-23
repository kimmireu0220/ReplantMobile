import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { tokens } from '../../design/tokens';
import SidebarItem from './SidebarItem';
import { useFocusTrap } from '../../hooks/useKeyboardNavigation';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { SkipLink } from '../ui/ScreenReaderOnly';

const SlidingSidebar = ({ isOpen, onClose, className = '', triggerRef }) => {
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const restoreTargetRef = useRef(null);
  
  // 포커스 트랩 적용
  const { focusFirst } = useFocusTrap(sidebarRef, isOpen);
  
  // 스와이프 제스처 적용
  useSwipeGesture(sidebarRef, {
    onSwipeLeft: () => {
      if (isOpen) {
        onClose();
      }
    },
    threshold: 50, // 50px 이상 스와이프 시 동작
    enabledGestures: ['swipe'],
    preventScroll: false // 세로 스크롤은 허용
  });
  
  // 화면 전체에서 우측 스와이프로 사이드바 열기
  useSwipeGesture(overlayRef, {
    onSwipeRight: () => {
      if (!isOpen) {
        // 화면 왼쪽 가장자리에서만 동작 (edge swipe)
        // 실제 구현에서는 터치 시작점이 화면 가장자리인지 확인 필요
      }
    },
    threshold: 30,
    enabledGestures: ['swipe'],
    preventScroll: false
  });

  // Menu items configuration
  const menuItems = [
    { to: '/', icon: '🏠', text: '홈' },
    { to: '/diary', icon: '📝', text: '감정 일기' },
    { to: '/mission', icon: '🎯', text: '미션' },
    { to: '/game', icon: '🎮', text: '미니게임' },
    { to: '/dex', icon: '📖', text: '캐릭터 도감' },
    { to: '/counsel', icon: '💬', text: '상담하기' },
    { to: '/settings', icon: '⚙️', text: '설정' },
    { to: '/components', icon: '🧩', text: '컴포넌트 (개발자용)' },
  ];

  // Handle escape key press and body overflow
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        // 닫기 전에 포커스 복원 목표 저장
        restoreTargetRef.current = triggerRef?.current || document.querySelector('#main-content');
        // aria/inert 토글 전 즉시 안전한 대상으로 포커스 이동
        try {
          if (triggerRef?.current && typeof triggerRef.current.focus === 'function') {
            triggerRef.current.focus();
          }
        } catch (_) { /* noop */ }
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
      
      // 접근성: 백그라운드 콘텐츠를 스크린 리더에서 숨김 (inert 속성 사용)
      const mainContent = document.querySelector('#main-content');
      if (mainContent) {
        mainContent.setAttribute('inert', '');
        // 추가 안전장치: 모든 포커스 가능한 요소를 비활성화
        const focusableElements = mainContent.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        focusableElements.forEach(element => {
          element.setAttribute('data-original-tabindex', element.getAttribute('tabindex') || '0');
          element.setAttribute('tabindex', '-1');
        });
      }
    } else {
      // Only restore if we previously set it
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
      
      // 백그라운드 콘텐츠 접근성 복구
      const mainContent = document.querySelector('#main-content');
      if (mainContent) {
        mainContent.removeAttribute('inert');
        // 포커스 가능한 요소 복구
        const focusableElements = mainContent.querySelectorAll('[data-original-tabindex]');
        focusableElements.forEach(element => {
          const originalTabindex = element.getAttribute('data-original-tabindex');
          if (originalTabindex === '0') {
            element.removeAttribute('tabindex');
          } else {
            element.setAttribute('tabindex', originalTabindex);
          }
          element.removeAttribute('data-original-tabindex');
        });
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Only restore if we previously set it
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
      
      // 정리: 백그라운드 콘텐츠 접근성 복구
      const mainContent = document.querySelector('#main-content');
      if (mainContent) {
        mainContent.removeAttribute('inert');
        // 포커스 가능한 요소 복구
        const focusableElements = mainContent.querySelectorAll('[data-original-tabindex]');
        focusableElements.forEach(element => {
          const originalTabindex = element.getAttribute('data-original-tabindex');
          if (originalTabindex === '0') {
            element.removeAttribute('tabindex');
          } else {
            element.setAttribute('tabindex', originalTabindex);
          }
          element.removeAttribute('data-original-tabindex');
        });
      }
    };
  }, [isOpen, onClose, triggerRef]);

  // Focus management - 포커스 복원 및 닫힘 시점 포커스 이동 보장
  useEffect(() => {
    if (isOpen) {
      // 열릴 때 첫 포커스 이동(트랩 훅 보조)
      setTimeout(() => {
        focusFirst();
      }, 150);
    } else {
      // 닫힐 때: 사이드바 내부에 포커스가 남아있으면 안전 대상으로 이동
      const activeEl = document.activeElement;
      const insideSidebar = activeEl && sidebarRef.current && sidebarRef.current.contains(activeEl);
      const target = restoreTargetRef.current || triggerRef?.current || document.querySelector('#main-content');
      if (insideSidebar && target && typeof target.focus === 'function') {
        // 렌더 사이클 이후에 포커스 이동 (aria-hidden/inert 적용 전에)
        requestAnimationFrame(() => {
          try { target.focus(); } catch (e) {}
        });
      }
      // 복원 대상 초기화
      restoreTargetRef.current = null;
    }
  }, [isOpen, focusFirst, triggerRef]);

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.colors.background.overlay,
    zIndex: tokens.zIndex.modal,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: `all ${tokens.animation.normal} ease`,
  };

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: window.innerWidth < 768 ? tokens.responsive?.sidebar?.mobile || '100%' : tokens.responsive?.sidebar?.desktop || '280px',
    height: '100vh',
    backgroundColor: tokens.colors.background.primary,
    boxShadow: tokens.shadow.md,
    zIndex: tokens.zIndex.modal + 1,
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: `transform ${tokens.animation.normal} cubic-bezier(0.4, 0, 0.2, 1)`,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  };

  const headerStyle = {
    padding: `${tokens.spacing[6]} ${tokens.spacing[4]} ${tokens.spacing[4]}`,
    borderBottom: `1px solid ${tokens.colors.border.light}`,
    backgroundColor: tokens.colors.background.secondary,
  };

  const titleStyle = {
    margin: 0,
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginTop: tokens.spacing[2], // Account for hamburger button space
  };

  const menuStyle = {
    flex: 1,
    padding: tokens.spacing[4],
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[1],
  };

  const footerStyle = {
    padding: tokens.spacing[4],
    borderTop: `1px solid ${tokens.colors.border.light}`,
    backgroundColor: tokens.colors.background.secondary,
  };

  const versionStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
  };

  const handleOverlayClick = (e) => {
    // Disable overlay clicks in demo environment
    if (e.target === overlayRef.current) {
      // 닫기 전에 트리거로 포커스 이동하여 aria/inert 충돌 방지
      try {
        if (triggerRef?.current && typeof triggerRef.current.focus === 'function') {
          triggerRef.current.focus();
        }
      } catch (_) { /* noop */ }
      onClose();
    }
  };

  const handleItemClick = () => {
    // Disable navigation in demo environment
    // 닫기 이전에 트리거 버튼으로 포커스 이동 (라우팅 전 안정화)
    try {
      if (triggerRef?.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus();
      }
    } catch (_) { /* noop */ }
    onClose();
  };

  return (
    <>
      {/* Skip Link for keyboard users */}
      {isOpen && <SkipLink href="#sidebar-menu" />}
      
      {/* Overlay */}
      <div
        ref={overlayRef}
        style={overlayStyle}
        onClick={handleOverlayClick}
        {...(!isOpen && { inert: "true" })}
        role="presentation"
        tabIndex={-1} // 포커스 불가능하게 설정
      />
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        style={sidebarStyle}
        className={`sliding-sidebar ${className}`}
        role="navigation"
        aria-label="메인 네비게이션"
        data-demo={false}
        data-environment="main"
        tabIndex={isOpen ? 0 : -1}
        {...(!isOpen && { inert: "true" })}
      >
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>Replant</h2>
        </div>

        {/* Menu Items */}
        <div id="sidebar-menu" style={menuStyle} role="menu">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              text={item.text}
              onClick={handleItemClick}
              role="menuitem"
              disabled={!isOpen}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <div style={versionStyle}>
            Replant v1.0.0
          </div>
        </div>
      </div>
    </>
  );
};

export default SlidingSidebar;

SlidingSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};