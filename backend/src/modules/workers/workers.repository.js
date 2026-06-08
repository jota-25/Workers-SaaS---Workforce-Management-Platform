import { prisma } from "../../lib/prisma.js";

export const workerRepository = {
  async findAll() {
    return prisma.worker.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findById(id) {
    return prisma.worker.findUnique({
      where: {
        id,
      },
    });
  },

  async findByEmail(email) {
    return prisma.worker.findUnique({
      where: {
        email,
      },
    });
  },

  async create(data) {
    return prisma.worker.create({
      data,
    });
  },

  async update(id, data) {
    return prisma.worker.update({
      where: {
        id,
      },
      data,
    });
  },

  

  async deactivate(id) {
    return prisma.worker.update({
        where: {
        id,
        },
        data: {
        isActive: false,
        updatedAt: new Date(),
        },
    });
  },

  


  async assignUser(
    workerId,
    userId
    ) {
    return prisma.worker.update({
      where: {
        id: workerId,
      },
      data: {
        userId,
      },
    });
  },

  async countActive() {
    return prisma.worker.count({
      where: {
        isActive: true,
      },
    });
  }
};