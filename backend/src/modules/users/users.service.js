import bcrypt from "bcrypt";

import { userRepository } from "./users.repository.js";
import { sessionRepository } from "../sessions/sessions.repository.js";

import { hashToken } from "../../shared/utils/hash.js";



export const userService = {

    async getUsers() {
        return userRepository.findAll();
        },

        async getUserById(id) {
            const user =
            await userRepository.findByIdWithRole(id);

            if (!user) {
            throw new Error("User not found");
            }

        return user;
    },


    async updateMyProfile(
            userId,
            data
            ) {

        const {
            nickname,
            email,
        } = data;

        return userRepository.update(
            userId,
            {
            nickname,
            email,
            isVerified: false,
            updatedAt: new Date(),
            }
        );
   },

    async changePassword(
        userId,
        {
            currentPassword,
            newPassword,
            refreshToken,
        }
        ) {

        const user =
            await userRepository.findById(userId);

        const valid =
            await bcrypt.compare(
            currentPassword,
            user.password
            );

        if (!valid) {
            throw new Error(
            "Incorrect password"
            );
        }

        const hashedPassword =
            await bcrypt.hash(
            newPassword,
            10
            );

        await userRepository.update(
            userId,
            {
            password: hashedPassword,
            forcePasswordChange: false,
            updatedAt: new Date(),
            }
        );

        if (refreshToken) {

            const hashedToken =
            hashToken(refreshToken);

            await sessionRepository.deleteOtherSessions(
            userId,
            hashedToken
            );
        }

        return {
            message: "Password updated",
        };
    },


    async adminResetPassword(
        id,
        newPassword
        ) {

        const hashedPassword =
            await bcrypt.hash(
            newPassword,
            10
            );

        await userRepository.update(
            Number(id),
            {
            password: hashedPassword,
            forcePasswordChange: true,
            updatedAt: new Date(),
            }
        );

        await sessionRepository.deleteByUserId(
            Number(id)
        );

        return {
            message: "Password reset",
        };
    },

    async deactivateUser(id) {

        await userRepository.update(
            Number(id),
            {
            isActive: false,
            updatedAt: new Date(),
            }
        );

        await sessionRepository.deleteByUserId(
            Number(id)
        );

        return {
            message: "User deactivated",
        };
    },
};