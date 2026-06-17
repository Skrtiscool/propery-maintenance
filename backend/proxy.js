const http = require('http');

// Creates a simple HTTP server that forwards to localhost:5000
const server = http.createServer((req, res) => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxy.on('error', () => {
    res.writeHead(502);
    res.end('Backend unavailable');
  });

  req.pipe(proxy);
});

server.listen(5001, () => {
  console.log('Proxy running on http://localhost:5001');
  console.log('Point ngrok/lt to port 5001 instead of 5000');
});
