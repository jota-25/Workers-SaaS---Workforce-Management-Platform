import { userRepository } from "../users/users.repository.js";
import { workerRepository } from "../workers/workers.repository.js";
import { invitationRepository } from "../invitations/invitations.repository.js";
import { activityLogsRepository } from "../activityLogs/activityLogs.repository.js";

export const getDashboardStats = async () => {

  const [
    activeUsers,
    activeWorkers,
    pendingInvites,
    activityByDay,
    lastLogins,
  ] = await Promise.all([
    userRepository.countUsers(),
    workerRepository.countActive(),
    invitationRepository.countPending(),
    activityLogsRepository.getActivityByDay(),
    activityLogsRepository.getLastLogins(),
  ]);

  return {
    activeUsers,
    activeWorkers,
    pendingInvites,
    activityByDay,
    lastLogins,
  };
};