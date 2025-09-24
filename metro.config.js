const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // filter-obj 오류 해결을 위한 설정
    unstable_enablePackageExports: false,
    unstable_conditionNames: ['react-native', 'browser', 'require'],
  },
  transformer: {
    // Metro bundler 안정성 향상
    unstable_allowRequireContext: false,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
