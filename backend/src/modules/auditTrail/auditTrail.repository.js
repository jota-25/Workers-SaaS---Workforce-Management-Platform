import { prisma } from "../../lib/prisma.js";

export const auditTrailRepository = {

  async create({
    userId,
    action,
    resource,
    resourceId,
    before,
    after,
    ip,
  }) {
    return prisma.auditTrail.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        beforeData: before,
        afterData: after,
        ip, 
      },
    });
  },

};