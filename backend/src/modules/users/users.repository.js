import { prisma } from "../../lib/prisma.js";

export const userRepository = {

  async findAll() {
    return prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  },

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findByNickname(nickname) {
    return prisma.user.findUnique({
      where: { nickname },
    });
  },

  async findByIdWithRole(id) {
    return prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        role: true,
      },
    });
  },

  async findByLogin(login) {
    return prisma.user.findFirst({
      where: {
        OR: [
          { email: login },
          { nickname: login },
        ],
      },
      include: {
        role: true,
      },
    });
  },
  
  async existsAnyUser() {
    const count = await prisma.user.count();

    return count > 0;
    },

  async create(data) {
    return prisma.user.create({
      data,
    });
  },

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async countUsers() {
    return prisma.user.count({
      where: {
        isActive: true,
      },
    });
  },

  async findByVerificationToken(token) {
    return prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });
  },

  async verifyEmail(token) {
    return prisma.user.updateMany({
      where: {
        emailVerificationToken: token,
      },
      data: {
        isVerified: true,
        emailVerificationToken: null,
      },
    });
  },

  async findByResetToken(token) {
    return prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });
  },

  async saveResetToken(email, token, expires) {
    return prisma.user.update({
      where: {
        email,
      },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });
  },

  async updatePassword(id, password) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        password,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        forcePasswordChange: false,
      },
    });
  },
  

  async findAll() {
    return prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  },

  async findByIdWithRole(id) {
    return prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        role: true,
      },
    });
  },


};
