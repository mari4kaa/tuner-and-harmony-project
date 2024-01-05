const SongService = require('../services/song-service');

class SongController {
  constructor() {
    this.songService = new SongService();
  }

  async getPlaylist(req, res, userId) {
    try {
      const playlist = await this.songService.getPlaylist(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(playlist));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`${error}`);
    }
  }

  async getSongById(req, res, songId) {
    try {
      const song = await this.songService.getSongById(songId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(song));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`${error}`);
    }
  }

  async createSong(req, res, userId) {
    try {
      const songData = req.body;
      const newSong = await this.songService.createSong(songData, userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newSong));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`${error}`);
    }
  }

  async updateSong(req, res, songId) {
    try {
      const songData = req.body;
      const updatedSong = await this.songService.updateSong(songData, songId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updatedSong));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`${error}`);
    }
  }

  async deleteSong(req, res, songId) {
    try {
      const deletedSong = await this.songService.deleteSong(songId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(deletedSong));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`${error}`);
    }
  }

}

module.exports = SongController;
