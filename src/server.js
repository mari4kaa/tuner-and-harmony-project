const http = require('http');
const fs = require('fs');
const path = require('path');
const sessions = require('client-sessions');
const UserController = require('./controllers/user-controller');

const port = 5000;
const userController = new UserController();

const sessionMiddleware = sessions({
  cookieName: 'session',
  secret: 'my-secret-key',
  duration: 24 * 60 * 60 * 1000,
});

const handleFileRequest = (res, req, filePath, contentType) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log('Request unknown URL', req.url);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Unknown URL');
    } else {
      console.log('Request URL', req.url);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
};

http.createServer((req, res) => {
  sessionMiddleware(req, res, () => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });

    if (req.url === '/') {
      const indexPath = path.join(__dirname, 'index.html');
      handleFileRequest(res, req, indexPath, 'text/html');
    } else if (req.url === '/signup' && req.method === 'POST') {
      req.on('end', () => {
        req.body = JSON.parse(data);
        console.log('Received sign-up request:', req.url);
        const newUser = userController.signUp(req, res);
        req.session.user = newUser;
      });
    } else if (req.url === '/signin' && req.method === 'POST') {
      req.on('end', () => {
        req.body = JSON.parse(data);
        console.log('Received sign-in request:', req.url);
        const authUser = userController.signIn(req, res);
        req.session.user = authUser;
      });
    } else if (req.url === '/signout' && req.method === 'POST') {
      req.session.destroy(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end();
      });
    } else if (req.method === 'PATCH') {
      const urlParts = req.url.split('/');
      const userId = parseInt(urlParts[urlParts.length - 1], 10);

      if (urlParts.length === 3 && urlParts[1] === 'users' && !isNaN(userId)) {
        req.on('end', () => {
          req.body = JSON.parse(data);
          userController.update(req, res, userId);
        });
      }
    } else if (req.method === 'DELETE') {
      const urlParts = req.url.split('/');
      const userId = parseInt(urlParts[urlParts.length - 1], 10);

      if (urlParts.length === 3 && urlParts[1] === 'users' && !isNaN(userId)) {
        userController.delete(req, res, userId);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
      }
    } else {
      const filePath = path.join(__dirname, req.url);
      const contentType = (path.extname(filePath) === '.css') ?
        'text/css' :
        'application/javascript';
      handleFileRequest(res, req, filePath, contentType);
    }
  });
}).listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
