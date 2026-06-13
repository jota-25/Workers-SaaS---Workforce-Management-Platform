import { prisma } from "../../lib/prisma.js";

export const activityLogsRepository = {

  async create({
    userId,
    action,
    resource,
    resourceId,
    ip,
  }) {
    return prisma.activityLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        ip,
      },
    });
  },


    async getActivityByDay() {
    return prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*)::int  as total
      FROM activity_logs
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `;
  },

  async getLastLogins() {
    return prisma.activityLog.findMany({
      where: {
        action: "LOGIN",
      },
      select: {
        userId: true,
        ip: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });
  },

  async getLogs(filters) {
    const {
      userId,
      action,
      worker,
      from,
      to,
      page = 1,
      limit = 10,
    } = filters;

    return prisma.activityLog.findMany({
      where: {
        ...(userId && { userId: Number(userId) }),
        ...(action && { action }),
        ...(worker && { resourceId: Number(worker) }),

        ...(from || to
          ? {
              createdAt: {
                ...(from && { gte: new Date(from) }),
                ...(to && { lte: new Date(to) }),
              },
            }
          : {}),
      },

      include: {
        user: {
          select: {
            email: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });
  },

  async countLogs(filters) {
    const {
      userId,
      action,
      worker,
      from,
      to,
    } = filters;

    return prisma.activityLog.count({
      where: {
        ...(userId && { userId: Number(userId) }),
        ...(action && { action }),
        ...(worker && { resourceId: Number(worker) }),

        ...(from || to
          ? {
              createdAt: {
                ...(from && { gte: new Date(from) }),
                ...(to && { lte: new Date(to) }),
              },
            }
          : {}),
      },
    });

  },

  async getActionsStats() {
    return prisma.$queryRaw`
      SELECT
        action,
        COUNT(*)::int as total
      FROM activity_logs
      GROUP BY action
      ORDER BY total DESC
    `;
  },
  async getUsersStats() {
    return prisma.$queryRaw`
      SELECT
        u.email,
        COUNT(*)::int as total
      FROM activity_logs l
      LEFT JOIN users u
        ON u.id = l.user_id
      GROUP BY u.email
      ORDER BY total DESC
    `;
  },

  async getActivityStatsByDay() {
    return prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*)::int as total
      FROM activity_logs
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
  },
};