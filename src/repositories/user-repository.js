const signUp = `
INSERT INTO users (login, password, email)
VALUES ($1, crypt($2, gen_salt('bf')), $3)
RETURNING *`;

const signIn = `
SELECT * FROM users 
WHERE login = $1`;

const getById = `
SELECT * FROM users
WHERE id = $1`;

const update = `
UPDATE users
SET login = $1, password = crypt($2, gen_salt('bf')), email = $3
WHERE id = $4
RETURNING *`;

const del = `
DELETE FROM users
WHERE id = $1
RETURNING *`;

const userExists = `
SELECT 1 FROM users WHERE id = $1`;

const paswdCompare = `
SELECT ($2 = crypt($1, $2)) as match 
FROM users
WHERE users.id = $3`;

const userQuery = {
  signUp,
  signIn,
  getById,
  update,
  del,
  userExists,
  paswdCompare,
};

module.exports = userQuery;
