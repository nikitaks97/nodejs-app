const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ res, data }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

describe('HTTP Server', function() {
  let server;
  const TEST_PORT = 3002;
  const TEST_HOST = '127.0.0.1';
  const BASE_URL = `http://${TEST_HOST}:${TEST_PORT}`;
  
  before(function(done) {
    const app = require('../index');
    if (app && typeof app.listen === 'function') {
      server = app.listen(TEST_PORT, TEST_HOST, done);
    } else if (app && typeof app.close === 'function') {
      server = app;
      setTimeout(done, 500);
    } else {
      done(new Error('Server could not be started for tests.'));
    }
  });

  after(function(done) {
    if (server && typeof server.close === 'function') {
      server.close(done);
    } else {
      done();
    }
  });

  // Create test files
  before(function() {
    const testAssetsDir = path.join(__dirname, '..', 'public', 'assets');
    fs.mkdirSync(testAssetsDir, { recursive: true });
    
    const testFiles = {
      'test.css': '.test{color:red}',
      'test.js': 'console.log("test");',
      'test.png': 'mock-image-content',
      'test.jpg': 'mock-image-content',
      'test.svg': '<svg></svg>'
    };

    Object.entries(testFiles).forEach(([file, content]) => {
      fs.writeFileSync(path.join(testAssetsDir, file), content);
    });
  });

  // Clean up test files
  after(function() {
    const testAssetsDir = path.join(__dirname, '..', 'public', 'assets');
    const testFiles = ['test.css', 'test.js', 'test.png', 'test.jpg', 'test.svg'];
    
    testFiles.forEach(file => {
      const filePath = path.join(testAssetsDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  it('should return the homepage', async function() {
    const { res, data } = await makeRequest(BASE_URL + '/');
    assert.ok(data.includes('<title>Welcome to My Node.js Website</title>'));
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['content-type'], 'text/html');
  });

  it('should return 404 for unknown page', async function() {
    const { res, data } = await makeRequest(BASE_URL + '/unknown');
    assert.strictEqual(res.statusCode, 404);
    assert.ok(data.includes('Page Not Found'));
  });

  // Test static asset serving with different content types
  const contentTypeTests = [
    { file: 'test.css', expectedType: 'text/css' },
    { file: 'test.js', expectedType: 'application/javascript' },
    { file: 'test.png', expectedType: 'image/png' },
    { file: 'test.jpg', expectedType: 'image/jpeg' },
    { file: 'test.svg', expectedType: 'image/svg+xml' }
  ];

  contentTypeTests.forEach(({ file, expectedType }) => {
    it(`should serve ${file} with correct content type`, async function() {
      const { res, data } = await makeRequest(BASE_URL + '/assets/' + file);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.headers['content-type'], expectedType);
      assert.ok(data.length > 0);
    });
  });

  it('should return 404 for missing static asset', async function() {
    const { res, data } = await makeRequest(BASE_URL + '/assets/nonexistent.css');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(data, 'Not Found');
  });  it('should return 500 when index.html cannot be read', async function() {
    // Create a mock fs.readFile that simulates an error
    const originalReadFile = fs.readFile;
    fs.readFile = function mockReadFile(filepath, callback) {
      if (filepath.includes('index.html')) {
        callback(new Error('EACCES: permission denied'), null);
      } else {
        originalReadFile(filepath, callback);
      }
    };

    try {
      const { res, data } = await makeRequest(BASE_URL + '/');
      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(data, 'Internal Server Error');
    } finally {
      // Restore original fs.readFile
      fs.readFile = originalReadFile;
    }
  });
});
