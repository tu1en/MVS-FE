const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8088",
      changeOrigin: true,
      secure: false,
      logLevel: "debug",
      // Don't rewrite path, backend expects /api prefix
    })
  );
};
