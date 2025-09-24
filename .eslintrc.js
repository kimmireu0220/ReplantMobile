module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: [
    'replant-web/public/sw.js',
    '**/sw.js',
    '**/service-worker.js'
  ],
  overrides: [
    {
      files: ['**/sw.js', '**/service-worker.js', '**/public/sw.js'],
      env: {
        serviceworker: true,
      },
      globals: {
        self: 'readonly',
        clients: 'readonly',
      },
      rules: {
        'no-restricted-globals': 'off',
        'no-undef': 'off',
        'array-callback-return': 'off',
      },
    },
  ],
};
