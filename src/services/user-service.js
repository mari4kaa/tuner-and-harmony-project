const argon = require('argon2');
const { PrismaClient } = require('@prisma/client');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

class UserService {

    constructor() {
      this.prisma = new PrismaClient();
    }

  async signUp({ login, password, email }) {
    const hashedPassword = await argon.hash(password);

    try {
      const user = await this.prisma.user.create({
        data: {
          login: login,
          password: hashedPassword,
          email: email,
        },
      });
      return user;
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code == 'P2002') {
              throw new Error('Login or email are not unique');
            }
        }
        throw error;
    }
  }

  async signIn({ login, password }) {
    const user = await this.prisma.user.findUnique({
      where: { login },
    });

    if (!user) throw new Error('Invalid credentials');

    const pwMatches = argon.verify(user.password, password);
    if(!pwMatches) throw new Error('Wrong password');

    return user;
  }
}

module.exports = UserService;
