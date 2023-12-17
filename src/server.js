const http = require('http');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const port = 5000;

const server = http.createServer((req, res) => {
  const handleFileRequest = (filePath, contentType) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  };

  const handleSignup = async (data) => {
    const { login, password, email } = JSON.parse(data);

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          login,
          password: hashedPassword,
          email,
        },
      });

      sendResponse(res, 200, { message: 'User created successfully', user });
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, { error: 'Internal Server Error' });
    }
  };

  const handleSignin = async (data) => {
    const { login, password } = JSON.parse(data);

    const user = await prisma.user.findUnique({
      where: {
        login,
      },
    });

    if (!user) {
      sendResponse(res, 404, { error: 'User not found' });
    } else {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        sendResponse(res, 200, { message: 'Login successful', user });
      } else {
        sendResponse(res, 401, { error: 'Invalid credentials' });
      }
    }
  };

  const sendResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  if (req.method === 'POST') {
    if (req.url === '/signup') {
      let data = '';

      req.on('data', chunk => {
        data += chunk;
      });

      req.on('end', () => {
        handleSignup(data);
      });
    } else if (req.url === '/signin') {
      let data = '';

      req.on('data', chunk => {
        data += chunk;
      });

      req.on('end', () => {
        handleSignin(data);
      });
    }
  } else {
    const filePath = path.join(__dirname, req.url);
    const contentType = path.extname(filePath) === '.css' ? 'text/css' : 'application/javascript';
    handleFileRequest(filePath, contentType);
  }
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
