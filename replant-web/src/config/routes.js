/**
 * Route Configuration for Replant App
 * Defines layout modes and isolation strategies for different route types
 */

export const DEMO_ROUTES = [
  '/components',
  '/storybook', 
  '/preview'
];

export const DEVELOPMENT_ROUTES = [
];

export const LAYOUT_EXCLUDED_ROUTES = [
  ...DEMO_ROUTES,
  '/embed',
  '/print',
  '/',
  '/start',
  '/nickname',
  '/game'
];

export const LAYOUT_MODES = {
  FULL: 'full',      // Complete AppLayout with navigation
  DEMO: 'demo',      // Isolated demo environment  
  MINIMAL: 'minimal' // Basic layout without global UI
};

/**
 * Determines the appropriate layout mode for a given pathname
 * @param {string} pathname - Current route pathname
 * @returns {string} Layout mode (full|demo|minimal)
 */
export const getLayoutMode = (pathname) => {
  if (DEMO_ROUTES.includes(pathname)) {
    return LAYOUT_MODES.DEMO;
  }
  
  // 게임 관련 경로는 모두 minimal 레이아웃 사용
  if (pathname.startsWith('/game')) {
    return LAYOUT_MODES.MINIMAL;
  }
  
  if (LAYOUT_EXCLUDED_ROUTES.includes(pathname)) {
    return LAYOUT_MODES.MINIMAL;
  }
  
  return LAYOUT_MODES.FULL;
};

/**
 * Checks if a route should have isolated global state
 * @param {string} pathname - Current route pathname
 * @returns {boolean} Whether route needs state isolation
 */
export const requiresStateIsolation = (pathname) => {
  return DEMO_ROUTES.includes(pathname);
};

/**
 * Checks if a route should disable global event listeners
 * @param {string} pathname - Current route pathname
 * @returns {boolean} Whether global events should be disabled
 */
export const shouldDisableGlobalEvents = (pathname) => {
  return DEMO_ROUTES.includes(pathname);
};

const routesConfig = {
  DEMO_ROUTES,
  LAYOUT_EXCLUDED_ROUTES,
  LAYOUT_MODES,
  getLayoutMode,
  requiresStateIsolation,
  shouldDisableGlobalEvents
};

export default routesConfig;