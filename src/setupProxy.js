const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8088/api",
      changeOrigin: true,
      secure: false,
      logLevel: "debug",
      pathRewrite: {
        "^/api": "" // Remove /api prefix when forwarding to backend
      }
    })
  );
};
