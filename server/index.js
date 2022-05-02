const express = require('express');
const morgan = require('morgan');
const {createProxyMiddleware} = require('http-proxy-middleware');

const app = express();

const PORT = 3228;
const HOST = 'localhost';
const API_SERVICE_URL = 'https://flomoapp.com';

// Logging
app.use(morgan('dev'));

app.use('/api', createProxyMiddleware({
  target: API_SERVICE_URL, changeOrigin: true, onProxyReq,
}));

function onProxyReq(proxyReq, req, res) {
  // add custom header to request
  const cookie = req.headers['fuck_cookie'];
  delete req.headers['fuck_cookie']
  console.log('onProxyReq[cookie]', cookie)
  console.log('x_xsrf_token',req.headers['x_xsrf_token'] )
  if (!cookie) {
    console.log('Error: Cookie is undefined')
    return;
  }
  proxyReq.setHeader('cookie', cookie);
  proxyReq.setHeader('accept', 'application/json, text/plain, */*');
  proxyReq.setHeader('accept-encoding', 'gzip, deflate, br');
  proxyReq.setHeader('user-agent', 'Chrome/98.0.4758.80 Safari/537.36 Edg/98.0.1108.43');
  proxyReq.setHeader('referer', 'https://flomoapp.com/mine?tag=inbox');
  proxyReq.setHeader('x-requested-with', 'XMLHttpRequest');
}

// Start the Proxy
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
