import { prisma } from "../../lib/prisma.js";

export const invitationRepository = {

  async create(data) {
    return prisma.invitation.create({
      data,
    });
  },

  async findByToken(token) {
    return prisma.invitation.findUnique({
      where: {
        token,
      },
    });
  },

  async findByEmail(email) {
    return prisma.invitation.findFirst({
      where: {
        email,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async markAsUsed(id) {
    return prisma.invitation.update({
      where: {
        id,
      },
      data: {
        used: true,
      },
    });
  },

  async findValidToken(token) {
    return prisma.invitation.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  },

  async findInviteInfo(token) {
      return prisma.invitation.findFirst({
        where: {
          token,
          used: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        select: {
          email: true,
        },
      });
 }, 

 async findAll() {
    return prisma.invitation.findMany({
      include: {
        role: true,
        worker: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findById(id) {
    return prisma.invitation.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        role: true,
        worker: true,
      },
    });
  },

  async updateToken(
    id,
    token,
    expiresAt
    ) {
    return prisma.invitation.update({
      where: {
        id: Number(id),
      },
      data: {
        token,
        expiresAt,
      },
    });
  },

  async deleteUnused(id) {
    return prisma.invitation.deleteMany({
      where: {
        id: Number(id),
        used: false,
      },
    });
  },

  async countPending() {
    return prisma.invitation.count({
      where: {
        used: false,
      },
    });
  }

};