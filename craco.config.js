module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Disable source-map-loader completely
      webpackConfig.module.rules = webpackConfig.module.rules.filter(rule => {
        return !(rule.loader && rule.loader.includes('source-map-loader'));
      });

      // Also disable devtool for source maps if needed
      if (env === 'development') {
        webpackConfig.devtool = false;
      }

      return webpackConfig;
    },
  },
  devServer: {
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
};
