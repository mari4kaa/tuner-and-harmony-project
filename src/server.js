const http = require('http');
const fs = require('fs');
const path = require('path');
const UserController = require('./controllers/user-controller');

const port = 5000;
const userController = new UserController();

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

const routeHandlers = {
  '/': {
    GET: (req, res) => {
      const indexPath = path.join(__dirname, 'index.html');
      handleFileRequest(res, req, indexPath, 'text/html');
    }
  },
  '/signup': {
    POST: async (req, res) => {
      console.log('Received sign-up request:', req.url);
      await userController.signUp(req, res);
    },
  },
  '/signin': {
    POST: async (req, res) => {
      console.log('Received sign-in request:', req.url);
      await userController.signIn(req, res);
    },
  },
  '/users': {
    GET: async (req, res) => {
      const urlParts = req.url.split('/');
      const userId = parseInt(urlParts[urlParts.length - 1], 10);

      if (urlParts.length === 3 && !isNaN(userId)) {
        await userController.getById(req, res, userId);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
      }
    },
    PATCH: async (req, res) => {
      const urlParts = req.url.split('/');
      const userId = parseInt(urlParts[urlParts.length - 1], 10);

      if (urlParts.length === 3 && !isNaN(userId)) {
        await userController.update(req, res, userId);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
      }
    },
    DELETE: async (req, res) => {
      const urlParts = req.url.split('/');
      const userId = parseInt(urlParts[urlParts.length - 1], 10);

      if (urlParts.length === 3 && !isNaN(userId)) {
        await userController.delete(req, res, userId);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
      }
    },
  },
};

const formShortUrl = (url) => {
  if (url === '/') return url;
  const urlParts = url.split('/')
    .filter(Boolean)
    .map((part) => `/${part}`);

  let shortUrl;
  if (urlParts.length > 1) {
    shortUrl = urlParts.slice(0, -1);
  } else {
    shortUrl = urlParts;
  }
  return shortUrl.join('');
};

http.createServer((req, res) => {
  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  });

  req.on('end', () => {
    const shortUrl = formShortUrl(req.url);
    console.log(shortUrl);
    const routeHandler = routeHandlers[shortUrl] && routeHandlers[shortUrl][req.method];

    if (routeHandler) {
      if (data) req.body = JSON.parse(data);
      routeHandler(req, res, data);
    } else {
      const filePath = path.join(__dirname, req.url);
      const contentType = path.extname(filePath) === '.css' ?
        'text/css' :
        'application/javascript';
      handleFileRequest(res, req, filePath, contentType);
    }
  });
}).listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
