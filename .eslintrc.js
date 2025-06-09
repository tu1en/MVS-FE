module.exports = {
  root: true,
  // Sử dụng cấu hình đơn giản nhất để tránh xung đột
  extends: [],
  rules: {
    // Tắt tất cả các quy tắc có thể gây xung đột
    'import/no-anonymous-default-export': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-unused-vars': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  // Không chỉ định plugins để tránh xung đột
  plugins: [],
  // Cấu hình đơn giản cho parser
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true
  }
};
