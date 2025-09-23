/**
 * CRA(Webpack 5)에서 Supabase realtime-js가 내부적으로 동적 require를 사용하면서
 * 발생하는 Critical dependency 경고를 완화하기 위한 설정입니다.
 *
 * - module.parser.javascript.exprContextCritical = false
 *   동적 expression require에 대해 critical로 간주하지 않도록 완화
 */
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 안전하게 parser 옵션 확장
      webpackConfig.module = webpackConfig.module || {};
      webpackConfig.module.parser = webpackConfig.module.parser || {};
      webpackConfig.module.parser.javascript = {
        ...webpackConfig.module.parser.javascript,
        exprContextCritical: false,
      };

      return webpackConfig;
    },
  },
};


