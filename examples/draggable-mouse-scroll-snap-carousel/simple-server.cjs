const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  console.log('Request:', req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  let filePath;
  
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'index.html');
  } else if (req.url === '/index.js') {
    filePath = path.join(__dirname, 'index.js');
  } else if (req.url.includes('assets/css/styles.css')) {
    // Handle the ../assets/css/styles.css path
    filePath = path.join(__dirname, '..', 'assets', 'css', 'styles.css');
  } else if (req.url.includes('anime.esm.js')) {
    // Handle the ../../lib/anime.esm.js path
    filePath = path.join(__dirname, '..', '..', 'lib', 'anime.esm.js');
  } else {
    res.writeHead(404);
    res.end('File not found: ' + req.url);
    return;
  }
  
  console.log('Serving file:', filePath);
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      console.error('Error reading file:', error);
      res.writeHead(500);
      res.end('Server error: ' + error.message);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = 9001;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/`);
  console.log(`📁 Serving from: ${__dirname}`);
  console.log(`🌐 Open your browser and go to: http://localhost:${PORT}`);
}); 