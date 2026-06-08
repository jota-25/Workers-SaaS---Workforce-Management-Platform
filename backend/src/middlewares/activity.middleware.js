import { activityLogsRepository } from "../modules/activityLogs/activityLogs.repository.js";

export const activityLogger = (action, resource = null) => {
  return async (req, res, next) => {

    res.on("finish", async () => {
      try {

        if (res.statusCode >= 400) return;

        await activityLogsRepository.create({
          userId: req.user?.id || null,
          action,
          resource,
          resourceId: req.params?.id || null,
          ip: req.ip,
        });

      } catch (err) {
        console.error("Activity log error", err);
      }
    });

    next();
  };
};