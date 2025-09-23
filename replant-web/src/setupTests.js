// Jest global setup for CRA
import '@testing-library/jest-dom';

// Filter noisy, known warnings that are not actionable in tests
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string') {
    // React Router v7 future flags deprecation warnings
    if (message.includes('React Router Future Flag Warning')) {
      return;
    }
  }
  return originalWarn.apply(console, args);
};

console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string') {
    // React act() wrapping warnings during tests
    if (message.includes('not wrapped in act(')) {
      return;
    }
  }
  return originalError.apply(console, args);
};


