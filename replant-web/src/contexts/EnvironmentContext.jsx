import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getLayoutMode, LAYOUT_MODES } from '../config/routes';
import { useLocation } from 'react-router-dom';

/**
 * Environment Context for managing global state isolation
 * Provides environment-aware state management and prevents cross-contamination
 */
const EnvironmentContext = createContext();

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};

export const EnvironmentProvider = ({ children }) => {
  const location = useLocation();
  const [environment, setEnvironment] = useState('main');
  const [globalState, setGlobalState] = useState({
    toasts: [],
    modals: [],
    sidebar: { isOpen: false },
    loading: false,
  });

  // Update environment based on current route
  useEffect(() => {
    const layoutMode = getLayoutMode(location.pathname);
    const newEnvironment = layoutMode === LAYOUT_MODES.DEMO ? 'demo' : 'main';
    
    if (newEnvironment !== environment) {
      setEnvironment(newEnvironment);
      
      // Reset global state when switching environments
      setGlobalState({
        toasts: [],
        modals: [],
        sidebar: { isOpen: false },
        loading: false,
      });
    }
  }, [location.pathname, environment]);

  // Environment-specific state management with proper memoization
  const addToast = useCallback((toast) => {
    if (environment === 'demo') {
      return;
    }
    
    setGlobalState(prev => ({
      ...prev,
      toasts: [...prev.toasts, { ...toast, id: Date.now() }]
    }));
  }, [environment]);

  const removeToast = useCallback((id) => {
    if (environment === 'demo') return;
    
    setGlobalState(prev => ({
      ...prev,
      toasts: prev.toasts.filter(toast => toast.id !== id)
    }));
  }, [environment]);

  const openModal = useCallback((modal) => {
    if (environment === 'demo') {
      return;
    }
    
    setGlobalState(prev => ({
      ...prev,
      modals: [...prev.modals, { ...modal, id: Date.now() }]
    }));
  }, [environment]);

  const closeModal = useCallback((id) => {
    if (environment === 'demo') return;
    
    setGlobalState(prev => ({
      ...prev,
      modals: prev.modals.filter(modal => modal.id !== id)
    }));
  }, [environment]);

  const setSidebarOpen = useCallback((isOpen) => {
    // Allow sidebar state changes in both environments for proper rendering
    setGlobalState(prev => ({
      ...prev,
      sidebar: { isOpen }
    }));
  }, []);

  const setLoading = useCallback((loading) => {
    if (environment === 'demo') return;
    
    setGlobalState(prev => ({
      ...prev,
      loading
    }));
  }, [environment]);

  const value = {
    environment,
    isDemoMode: environment === 'demo',
    isMainMode: environment === 'main',
    globalState,
    
    // Toast management
    addToast,
    removeToast,
    
    // Modal management
    openModal,
    closeModal,
    
    // Sidebar management
    setSidebarOpen,
    isSidebarOpen: globalState.sidebar.isOpen,
    
    // Loading state
    setLoading,
    isLoading: globalState.loading,
  };

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export default EnvironmentContext;