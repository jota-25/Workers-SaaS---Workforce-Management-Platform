import { prisma } from "../../lib/prisma.js";

export const sessionRepository = {

  async create(data) {
    return prisma.session.create({
      data,
    });
  },

  


 

  async updateToken(
    id,
    refreshToken,
    expiresAt
  ) {
    return prisma.session.update({
      where: {
        id,
      },
      data: {
        refreshToken,
        expiresAt,
        lastUsedAt: new Date(),
      },
    });
  },

  


  async update(id, data) {
    return prisma.session.update({
      where: {
        id,
      },
      data,
    });
  },

  async deleteByRefreshToken(refreshToken) {
    return prisma.session.deleteMany({
      where: {
        refreshToken,
      },
    });
  },

  async deleteByUserId(userId) {
    return prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  },


  async findValidSession(refreshToken) {
    return prisma.session.findFirst({
      where: {
        refreshToken,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  },

  

  async deleteOtherSessions(
    userId,
    currentRefreshToken
    ) {
    return prisma.session.deleteMany({
      where: {
        userId,
        NOT: {
          refreshToken: currentRefreshToken,
        },
      },
    });
  },

  async getUserSessions(userId) {
    return prisma.session.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        ip: true,
        userAgent: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
      },
      orderBy: {
        lastUsedAt: "desc",
      },
    });
  },


  async deleteUserSession(
      sessionId,
      userId
    ) {
      return prisma.session.deleteMany({
        where: {
          id: Number(sessionId),
          userId,
        },
      });
  },
  
      


};