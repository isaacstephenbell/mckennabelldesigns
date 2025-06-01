const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log('Request:', pathname);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  let filePath;
  
  try {
    // Main gallery index
    if (pathname === '/' || pathname === '/index.html') {
      filePath = path.join(__dirname, 'index.html');
    }
    // Individual example routes
    else if (pathname.match(/^\/([^\/]+)\/?$/)) {
      const exampleName = pathname.replace(/^\/([^\/]+)\/?$/, '$1');
      const examplePath = path.join(__dirname, exampleName);
      
      console.log('Looking for example:', exampleName);
      console.log('Example path:', examplePath);
      
      // Check if example directory exists
      if (fs.existsSync(examplePath) && fs.statSync(examplePath).isDirectory()) {
        const indexPath = path.join(examplePath, 'index.html');
        if (fs.existsSync(indexPath)) {
          filePath = indexPath;
        } else {
          console.log('index.html not found in:', examplePath);
          res.writeHead(404);
          res.end(`index.html not found in example "${exampleName}"`);
          return;
        }
      } else {
        console.log('Example directory not found:', examplePath);
        res.writeHead(404);
        res.end(`Example "${exampleName}" directory not found`);
        return;
      }
    }
    // Example assets (JS files within example directories)
    else if (pathname.match(/^\/([^\/]+)\/(.+)$/)) {
      const exampleName = pathname.replace(/^\/([^\/]+)\/(.+)$/, '$1');
      const assetPath = pathname.replace(/^\/([^\/]+)\/(.+)$/, '$2');
      
      console.log('Example asset request:', exampleName, '/', assetPath);
      
      // Handle special cases for relative paths
      if (assetPath.includes('../assets/css/styles.css')) {
        filePath = path.join(__dirname, 'assets', 'css', 'styles.css');
      } else if (assetPath.includes('../lib/anime.esm.js') || assetPath.includes('anime.esm.js')) {
        filePath = path.join(__dirname, '..', 'lib', 'anime.esm.js');
      } else {
        filePath = path.join(__dirname, exampleName, assetPath);
      }
    }
    // Direct shared assets
    else if (pathname.includes('assets/css/styles.css')) {
      filePath = path.join(__dirname, 'assets', 'css', 'styles.css');
    }
    else if (pathname.includes('anime.esm.js')) {
      filePath = path.join(__dirname, '..', 'lib', 'anime.esm.js');
    }
    // Handle lib folder requests
    else if (pathname.startsWith('/lib/')) {
      const libAsset = pathname.replace('/lib/', '');
      filePath = path.join(__dirname, '..', 'lib', libAsset);
    }
    // Favicon requests
    else if (pathname === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }
    // 404 for everything else
    else {
      console.log('404 - File not found:', pathname);
      res.writeHead(404);
      res.end('File not found: ' + pathname);
      return;
    }
    
    console.log('Attempting to serve file:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('File does not exist:', filePath);
      res.writeHead(404);
      res.end('File not found: ' + path.basename(filePath));
      return;
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        console.error('Error reading file:', error);
        res.writeHead(500);
        res.end('Server error: ' + error.message);
      } else {
        console.log('Successfully served:', path.basename(filePath));
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end('Internal server error: ' + error.message);
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

const PORT = 9001;
server.listen(PORT, () => {
  console.log(`🎬 Anime.js Examples Gallery running at http://localhost:${PORT}/`);
  console.log(`📁 Serving from: ${__dirname}`);
  console.log(`🌐 Open your browser and go to: http://localhost:${PORT}`);
  console.log(`\n✨ Available examples:`);
  
  // List all available examples
  try {
    const examples = fs.readdirSync(__dirname)
      .filter(item => {
        const itemPath = path.join(__dirname, item);
        try {
          return fs.statSync(itemPath).isDirectory() && item !== 'assets';
        } catch (e) {
          return false;
        }
      })
      .sort();
    
    examples.forEach(example => {
      console.log(`   • http://localhost:${PORT}/${example}/`);
    });
  } catch (error) {
    console.log('   Could not list examples');
  }
  
  console.log(`\n🔧 Server is running with improved error handling!`);
}); 