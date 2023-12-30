const http = require('http');
const fs = require('fs');
const path = require('path');
const UserController = require('./controllers/user-controller');

const port = 5000;
const userController = new UserController();

http.createServer((req, res) => {
  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  });

  if (req.url === '/signup' && req.method === 'POST') {
    req.on('end', () => {
      req.body = JSON.parse(data);
      userController.signUp(req, res);
    });
  } else if (req.url === '/signin' && req.method === 'POST') {
    req.on('end', () => {
      req.body = JSON.parse(data);
      userController.signIn(req, res);
    });
  } else if (req.url === '/users' && req.method === 'PATCH') {
    req.on('end', () => {
      req.body = JSON.parse(data);
      userController.update(req, res);
    });
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

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  }
}).listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
