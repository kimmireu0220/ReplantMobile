/**
 * 공통 렌더링 헬퍼 유틸리티
 * 모든 컴포넌트 테스트에서 필요한 프로바이더들을 자동으로 감싸서 렌더링
 */
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SupabaseContext } from '../contexts/SupabaseContext';
import { EnvironmentContext } from '../contexts/EnvironmentContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { createMockSupabaseClient } from './mockSupabase';

// 기본 컨텍스트 값들
const defaultEnvironmentValue = {
  isDevelopment: true,
  isProduction: false
};

const defaultThemeValue = {
  theme: 'light',
  toggleTheme: jest.fn(),
  themes: {
    light: { primary: '#4F46E5' },
    dark: { primary: '#818CF8' }
  }
};

const AllTheProviders = ({ children, options = {} }) => {
  const {
    supabaseValue,
    environmentValue = defaultEnvironmentValue,
    themeValue = defaultThemeValue,
    withRouter = true
  } = options;

  // Supabase 모킹이 제공되지 않으면 기본 모킹 사용
  const mockSupabase = supabaseValue || createMockSupabaseClient().supabase;

  const Wrapper = ({ children }) => (
    <SupabaseContext.Provider value={mockSupabase}>
      <EnvironmentContext.Provider value={environmentValue}>
        <ThemeContext.Provider value={themeValue}>
          {withRouter ? (
            <BrowserRouter>{children}</BrowserRouter>
          ) : (
            children
          )}
        </ThemeContext.Provider>
      </EnvironmentContext.Provider>
    </SupabaseContext.Provider>
  );

  return <Wrapper>{children}</Wrapper>;
};

export const renderWithProviders = (ui, options = {}) => {
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} options={options} />,
    ...options.renderOptions
  });
};

// 라우터 없이 렌더링 (단순 컴포넌트 테스트용)
export const renderWithoutRouter = (ui, options = {}) => {
  return renderWithProviders(ui, {
    ...options,
    withRouter: false
  });
};

// 특정 테마로 렌더링
export const renderWithTheme = (ui, theme = 'light', options = {}) => {
  const themeValue = {
    theme,
    toggleTheme: jest.fn(),
    themes: {
      light: { primary: '#4F46E5', background: '#FFFFFF' },
      dark: { primary: '#818CF8', background: '#1F2937' }
    }
  };

  return renderWithProviders(ui, {
    ...options,
    themeValue
  });
};

// 특정 사용자 상태로 렌더링 (인증된 사용자)
export const renderWithAuthenticatedUser = (ui, userOverrides = {}, options = {}) => {
  const mockSupabaseClient = createMockSupabaseClient();
  
  // 인증된 사용자 상태 모킹
  mockSupabaseClient.supabase.auth = {
    getUser: jest.fn(() => Promise.resolve({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          ...userOverrides
        }
      },
      error: null
    })),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
  };

  return renderWithProviders(ui, {
    ...options,
    supabaseValue: mockSupabaseClient.supabase
  });
};

// 에러 상태 테스트용 렌더링
export const renderWithErrorBoundary = (ui, options = {}) => {
  const ErrorBoundaryWrapper = ({ children }) => {
    try {
      return <div data-testid="error-boundary-wrapper">{children}</div>;
    } catch (error) {
      return <div data-testid="error-boundary-fallback">Error occurred</div>;
    }
  };

  return renderWithProviders(
    <ErrorBoundaryWrapper>{ui}</ErrorBoundaryWrapper>,
    options
  );
};