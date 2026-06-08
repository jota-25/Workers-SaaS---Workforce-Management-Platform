import { sessionRepository } from "./sessions.repository.js";
import { hashToken } from "../../shared/utils/hash.js";

export const sessionService = {
    async getMySessions(userId) {
        return sessionRepository.getUserSessions(
            userId
        );
    },

    async deleteSession(
        sessionId,
        userId
        ) {
        const result =
            await sessionRepository.deleteUserSession(
            sessionId,
            userId
            );

        if (result.count === 0) {
            throw {
            status: 404,
            message: "Sesión no encontrada",
            };
        }

        return true;
    },

    async deleteOtherSessions(
        userId,
        refreshToken
        ) {

        const hashedToken =
            hashToken(refreshToken);

        const result =
            await sessionRepository.deleteOtherSessions(
            userId,
            hashedToken
            );

        return result.count;
        },

    async deleteAllSessions(userId) {

        const result =
            await sessionRepository.deleteByUserId(
            userId
            );

        return result.count;
    }
};
