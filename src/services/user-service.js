const pool = require('../pool');
const userQuery = require('../repositories/user-repository');

const comparePasswords = async (inputPassword, hashedPassword, userId) => {
  const query = userQuery.paswdCompare;
  const { rows } = await pool.query(query, [inputPassword, hashedPassword, userId]);
  return rows[0].match;
};

const userExists = async (userId) => {
  const query = userQuery.userExists;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

class UserService {
  async signUp({ login, password, email }) {
    try {
      const query = userQuery.signUp;
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
    const query =  userQuery.signIn;
    const { rows } = await pool.query(query, [login]);
    const user = rows[0];
    if (!user) throw new Error('Invalid credentials');

    const pwMatches = await comparePasswords(password, user.password, user.id);
    if (!pwMatches) throw new Error('Wrong password');

    return user;
  }

  async getById(userId) {
    const existingUser = await userExists(userId);
    if (!existingUser.length) throw new Error('User not found');

    const query =  userQuery.getById;
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
  }

  async update({ login, password, email }, userId) {
    const existingUser = await userExists(userId);
    if (!existingUser.length) throw new Error('User not found');

    const updatedAt = Date.now();

    const query = userQuery.update;
    const { rows } = await pool.query(query, [login, password, email, updatedAt, userId]);
    return rows[0];
  }

  async delete(userId) {
    const existingUser = await userExists(userId);
    if (!existingUser.length) throw new Error('User not found');

    const query = userQuery.del;
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
  }
}

module.exports = UserService;
