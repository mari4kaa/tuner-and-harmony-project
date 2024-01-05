const pool = require('../pool');
const songQuery = require('../repositories/song-repository');
const parseSong = require('../songParser');

const songExists = async (userId) => {
  const query = songQuery.songExists;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

class SongService {
  async getPlaylist(userId) {
    const query = songQuery.getPlaylist;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  async getSongById(songId) {
    const existingSong = await songExists(songId);
    if (!existingSong.length) throw new Error('Song not found');

    const query = songQuery.getSongById;
    const { rows } = await pool.query(query, [songId]);
    return rows[0];
  }

  async createSong({ name, contentPath }, userId) {
    const content = await parseSong(contentPath);
    const query = songQuery.createSong;
    const { rows } = await pool.query(query, [name, content]);

    const queryPlaylist = songQuery.putSongToPlaylist;
    await pool.query(queryPlaylist, [userId]);
    return rows[0];
  }

  async updateSong({ name, contentPath }, songId) {
    const existingSong = await songExists(songId);
    if (!existingSong.length) throw new Error('Song not found');

    const content = await parseSong(contentPath);
    const query = songQuery.updateSong;
    const { rows } = await pool.query(query, [name, content, songId]);
    return rows[0];
  }

  async deleteSong(songId) {
    const existingSong = await songExists(songId);
    if (!existingSong.length) throw new Error('Song not found');

    const query = songQuery.deleteSong;
    const { rows } = await pool.query(query, [songId]);
    return rows[0];
  }
}

module.exports = SongService;
