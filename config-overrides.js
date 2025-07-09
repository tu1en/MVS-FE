const { override } = require('customize-cra');

module.exports = override(
  (config, env) => {
    // Remove source-map-loader from webpack config
    config.module.rules = config.module.rules.filter(rule => {
      return !(rule.loader && rule.loader.includes('source-map-loader'));
    });

    // Disable source maps
    config.devtool = false;

    return config;
  }
);
