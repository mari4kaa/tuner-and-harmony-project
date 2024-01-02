const UserService = require('../services/user-service');

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async signUp(req, res) {
    try {
      const userData = req.body;
      const newUser = await this.userService.signUp(userData);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newUser));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`${error}`);
    }
  }

  async signIn(req, res) {
    try {
      const credentials = req.body;
      const authenticatedUser = await this.userService.signIn(credentials);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(authenticatedUser));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`${error}`);
    }
  }

  async update(req, res, userId) {
    try {
      const updatedUser = req.body;
      const deletedUser = await this.userService.update(updatedUser, userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(deletedUser));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`${error}`);
    }
  }

  async delete(req, res, userId) {
    try {
      const deletedUser = await this.userService.delete(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(deletedUser));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`${error}`);
    }
  }
}

module.exports = UserController;
