import { invitationRepository } from "./invitations.repository.js";
import { generateInviteToken } from "../../shared/utils/invite.js";
import { sendEmail } from "../../shared/utils/mailer.js";


export const invitationService = {

    async getInvitations() {
    const invitations =
        await invitationRepository.findAll();

    return invitations.map(invite => ({
        id: invite.id,
        email: invite.email,
        expires_at: invite.expiresAt,
        used: invite.used,
        created_at: invite.createdAt,
        role: invite.role?.name,
        worker_name: invite.worker?.name,
    }));
    },
    async resendInvitation(id) {

    const invitation =
        await invitationRepository.findById(id);

    if (
        !invitation ||
        invitation.used
    ) {
        throw {
        status: 404,
        message:
            "Invitación no encontrada o ya usada",
        };
    }

    const newToken =
        generateInviteToken();

    const newExpiry =
        new Date(
        Date.now() +
        2 * 24 * 60 * 60 * 1000
        );

    await invitationRepository.updateToken(
        id,
        newToken,
        newExpiry
    );

    const inviteLink =
        `${process.env.FRONTEND_URL}/invite/${newToken}`;

    await sendEmail({
        to: invitation.email,
        subject: "Invitación reenviada",
        html: `
        <h2>Nueva invitación</h2>

        <p>Tu invitación fue reenviada.</p>

        <a href="${inviteLink}">
            Aceptar invitación
        </a>

        <p>El enlace expira en 2 días.</p>
        `,
    });

    return true;
    },

    async cancelInvitation(id) {

    const result =
        await invitationRepository.deleteUnused(
        id
        );

    if (result.count === 0) {
        throw {
        status: 404,
        message:
            "Invitación no encontrada o ya usada",
        };
    }

    return true;
    },
};