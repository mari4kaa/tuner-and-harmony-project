const UserService = require('../services/user-service');

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async wrapControl(req, res, callback, ...args) {
    try {
      const data = await callback(...args);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`${error}`);
    }
  }

  async signUp(req, res) {
    const userData = req.body;
    await this.wrapControl(req, res, this.userService.signUp, userData);
  }

  async signIn(req, res) {
    const credentials = req.body;
    await this.wrapControl(req, res, this.userService.signIn, credentials);
  }

  async getById(req, res, userId) {
    await this.wrapControl(req, res, this.userService.getById, userId);
  }

  async update(req, res, userId) {
    const updatedUser = req.body;
    await this.wrapControl(req, res, this.userService.update, updatedUser, userId);
  }

  async delete(req, res, userId) {
    await this.wrapControl(req, res, this.userService.delete, userId);
  }
}

module.exports = UserController;
