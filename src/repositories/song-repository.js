const songQuery = {
  getPlaylist: `
      SELECT *
      FROM playlist
      WHERE user_id = $1
    `,

  getSongById: `
      SELECT *
      FROM songs
      WHERE id = $1
    `,

  createSong: `
    INSERT INTO songs (name, content)
    VALUES ($1, $2)
    RETURNING *
    `,

  putSongToPlaylist: `
    INSERT INTO playlist (user_id, song_id)
    VALUES ($1, (SELECT id FROM songs ORDER BY id DESC LIMIT 1))
    RETURNING *
    `,

  updateSong: `
      UPDATE songs
      SET name = $1, content = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `,

  deleteSong: `
      DELETE FROM songs
      WHERE id = $1
      RETURNING *
    `,

  songExists: `
    SELECT 1 FROM songs WHERE id = $1`,
};

module.exports = songQuery;
