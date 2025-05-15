const assert = require('assert');
const http = require('http');

describe('HTTP Server', function() {
  let server;
  before(function(done) {
    // Import the app and start the server only if not already started
    const app = require('../index');
    if (app && typeof app.listen === 'function') {
      server = app.listen(3002, '127.0.0.1', done); // Use a different port for testing
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
  it('should return the homepage', function(done) {
    http.get('http://127.0.0.1:3002/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        assert.ok(data.includes('<title>Welcome to My Node.js Website</title>'));
        done();
      });
    });
  });
  it('should return 404 for unknown page', function(done) {
    http.get('http://127.0.0.1:3002/unknown', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        assert.strictEqual(res.statusCode, 404);
        assert.ok(data.includes('Page Not Found'));
        done();
      });
    });
  });
});
