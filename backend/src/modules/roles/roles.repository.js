import { prisma } from "../../lib/prisma.js";

export const roleRepository = {

  async findById(id) {
    return prisma.role.findUnique({
      where: {
        id,
      },
    });
  },

  async findByName(name) {
    return prisma.role.findUnique({
      where: {
        name,
      },
    });
  },

 

};