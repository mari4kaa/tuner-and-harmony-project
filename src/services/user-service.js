const pool = require('../pool');

const comparePasswords = async (inputPassword, hashedPassword) => {
  const query = `
  SELECT $1 = crypt($2, $3) as match`;

  const { rows } = await pool.query(query, [true, inputPassword, hashedPassword]);
  return rows[0].match;
};

const userExists = async (userId) => {
  const query = `
  SELECT 1 FROM users WHERE id = $1`;

  const { rows } = await pool.query(query, [userId]);
  return rows;
};

class UserService {
  async signUp({ login, password, email }) {
    try {
      const query = `
        INSERT INTO users (login, password, email)
        VALUES ($1, crypt($2, gen_salt('bf')), $3)
        RETURNING *`;

      const { rows } = await pool.query(query, [login, password, email]);
      return rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Login or email are not unique');
      }
      throw error;
    }
  }

  async signIn({ login, password }) {
    const query = `
    SELECT * FROM users 
    WHERE login = $1`;

    const { rows } = await pool.query(query, [login]);
    const user = rows[0];
    if (!user) throw new Error('Invalid credentials');

    const pwMatches = await comparePasswords(password, user.password);
    if (!pwMatches) throw new Error('Wrong password');

    return user;
  }

  async delete(userId) {
    const existingUser = await userExists(userId);
    if (!existingUser.length) throw new Error('User not found');

    const query = `
    DELETE FROM users
    WHERE id = $1
    RETURNING *`;
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
  }

  async update({ login, password, email, userId }) {
    const query = `
      UPDATE users
      SET login = $1, password = crypt($2, gen_salt('bf')), email = $3
      WHERE id = $4
      RETURNING *`;

    const { rows } = await pool.query(query, [login, password, email, userId]);
    return rows[0];
  }
}

module.exports = UserService;
