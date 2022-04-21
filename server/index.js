const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const PORT = 3000;
const HOST = 'localhost';
const API_SERVICE_URL = 'https://flomoapp.com';

// Logging
app.use(morgan('dev'));

app.use(
    '/flomo',
    createProxyMiddleware({
        target: API_SERVICE_URL,
        changeOrigin: true,
        onProxyReq,
        pathRewrite: {
            [`^/flomo`]: '',
        },
    })
);

function onProxyReq(proxyReq, req, res) {
    const cookie =
        'amplitude_id_fef1e872c952688acd962d30aa545b9eflomoapp.com=eyJkZXZpY2VJZCI6ImQ3MDZiYTYwLTA1YjYtNGMwNC04YTMxLWM5NTM1ZTQ5YmEzZlIiLCJ1c2VySWQiOm51bGwsIm9wdE91dCI6ZmFsc2UsInNlc3Npb25JZCI6MTYyNTIwNTI3NDU3OSwibGFzdEV2ZW50VGltZSI6MTYyNTIwNTI3NDU4MCwiZXZlbnRJZCI6MSwiaWRlbnRpZnlJZCI6MCwic2VxdWVuY2VOdW1iZXIiOjF9; XSRF-TOKEN=eyJpdiI6ImJpYmJTSlVLa2RVbEFTWlRDNU1iUGc9PSIsInZhbHVlIjoiYjdkQ1wvMTZoTnh1d3c5OE5DYzhcL2hnU0hXQ3oxZzRIczJCSGxNTGZjcytsY1hiMlJNVWNMNzVmTWlQSktjdUppIiwibWFjIjoiZjI1NTQzOGU4MmU0NjNlYzg4ODczNDA0ZjhkZDdhY2Q5MTQyYmM5YTA5NjIyY2Q5OTZhNzM4OWY1ZmJjNTI1ZiJ9; flomo_session=eyJpdiI6Ik42TG5wNFlieStMdVMxeVp0T1Ura0E9PSIsInZhbHVlIjoiODJRODhZSTVnUFNTSkxTSHhRQXk5OW1QcHQ0TnpqZnRSSlNvMzlsMzJ3eUZBS3YwMjZzNlRORHNkczRNN09mdyIsIm1hYyI6IjVkNWQ4YWNmZDk1OWJiNWI3YjA2OTgyOWM5NzA0ODZlYWVkOTljMzY2NjhiN2QwODQ5YzE1Y2E5NTFlZGFlNmYifQ==';
    // add custom header to request
    proxyReq.setHeader('accept', 'application/json, text/plain, */*');
    proxyReq.setHeader('accept-encoding', 'gzip, deflate, br');
    proxyReq.setHeader('user-agent', 'Chrome/98.0.4758.80 Safari/537.36 Edg/98.0.1108.43');
    proxyReq.setHeader('accept', 'XMLHttpRequest');
    proxyReq.setHeader('referer', 'https://flomoapp.com/mine?tag=inbox');
    proxyReq.setHeader('x-requested-with', 'foobar');
    proxyReq.setHeader('cookie', cookie);
}

// Start the Proxy
app.listen(PORT, HOST, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
