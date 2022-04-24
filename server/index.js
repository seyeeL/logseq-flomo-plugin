const express = require('express');
const morgan = require('morgan');
const {createProxyMiddleware} = require('http-proxy-middleware');

const app = express();

const PORT = 3000;
const HOST = 'localhost';
const API_SERVICE_URL = 'https://flomoapp.com';

// Logging
app.use(morgan('dev'));

app.use('/flomo', createProxyMiddleware({
  target: API_SERVICE_URL, changeOrigin: true, onProxyReq, pathRewrite: {
    [`^/flomo`]: '',
  },
}));

function onProxyReq(proxyReq, req, res) {
  // add custom header to request
  proxyReq.setHeader('accept', 'application/json, text/plain, */*');
  proxyReq.setHeader('accept-encoding', 'gzip, deflate, br');
  proxyReq.setHeader('user-agent', 'Chrome/98.0.4758.80 Safari/537.36 Edg/98.0.1108.43');
  proxyReq.setHeader('referer', 'https://flomoapp.com/mine?tag=inbox');
  proxyReq.setHeader('x-requested-with', 'XMLHttpRequest');

  const { cookie } = require('../temp/setting.json');
  proxyReq.setHeader('cookie', cookie);
}

// Start the Proxy
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
