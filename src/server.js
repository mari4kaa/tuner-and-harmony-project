const http = require('http');
const fs = require('fs');
const path = require('path');
const UserController = require('./controllers/user-controller');
const SongController = require('./controllers/song-controller');

const port = 5000;
const userController = new UserController();
const songController = new SongController();

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

const idValidationWrap = async (req, res, urlLength, callback) => {
  const urlParts = req.url.split('/');
  const id = parseInt(urlParts[urlParts.length - 1], 10);

  if (urlParts.length === urlLength && !isNaN(id)) {
    await callback(req, res, id);
  } else {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
  }
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
      await userController.signUp(req, res);
    },
  },
  '/signin': {
    GET: async (req, res) => {
      await userController.signIn(req, res);
    },
  },
  '/users': {
    GET: async (req, res) => {
      await idValidationWrap(req, res, 3, userController.getById.bind(userController));
    },
    PATCH: async (req, res) => {
      await idValidationWrap(req, res, 3, userController.update.bind(userController));
    },
    DELETE: async (req, res) => {
      await idValidationWrap(req, res, 3, userController.delete.bind(userController));
    },
  },
  '/songs': {
    GET: async (req, res) => {
      await idValidationWrap(req, res, 3, songController.getSongById.bind(songController));
    },
    PATCH: async (req, res) => {
      await idValidationWrap(req, res, 3, songController.updateSong.bind(songController));
    },
    DELETE: async (req, res) => {
      await idValidationWrap(req, res, 3, songController.deleteSong.bind(songController));
    },
  },
  '/song/user': {
    POST: async (req, res) => {
      await idValidationWrap(req, res, 4, songController.createSong.bind(songController));
    },
  },
  '/playlist/user': {
    GET: async (req, res) => {
      await idValidationWrap(req, res, 4, songController.getPlaylist.bind(songController));
    }
  }
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
