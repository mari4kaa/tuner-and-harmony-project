const SongService = require('../services/song-service');

class SongController {
  constructor() {
    this.songService = new SongService();
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

  async getPlaylist(req, res, userId) {
    await this.wrapControl(req, res, this.songService.getPlaylist, userId);
  }

  async getSongById(req, res, songId) {
    await this.wrapControl(req, res, this.songService.getSongById, songId);
  }

  async createSong(req, res, userId) {
    const songData = req.body;
    await this.wrapControl(req, res, this.songService.createSong, songData, userId);
  }

  async updateSong(req, res, songId) {
    const songData = req.body;
    await this.wrapControl(req, res, this.songService.updateSong, songData, songId);
  }

  async deleteSong(req, res, songId) {
    await this.wrapControl(req, res, this.songService.deleteSong, songId);
  }

}

module.exports = SongController;
