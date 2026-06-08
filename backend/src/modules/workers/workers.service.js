import { workerRepository } from "./workers.repository.js";
import { invitationRepository } from "../invitations/invitations.repository.js";
import { activityLogsRepository } from "../activityLogs/activityLogs.repository.js";
import { auditTrailRepository } from "../auditTrail/auditTrail.repository.js";
import { generateInviteToken } from "../../shared/utils/invite.js";
import { sendEmail } from "../../shared/utils/mailer.js";
import { roleRepository } from "../roles/roles.repository.js";

export const workerService = {
  async getAllWorkers() {
    return workerRepository.findAll();
  },

  async getWorkerById(id) {
    const worker = await workerRepository.findById(id);

    if (!worker) {
      throw new Error("Trabajador no encontrado");
    }

    return worker;
  },

  async createWorker({ data, user, ip }) {

    const existingWorker =
      await workerRepository.findByEmail(data.email);

    if (existingWorker) {
      throw new Error(
        "Ya existe un trabajador con ese correo"
      );
    }
    // Crear trabajador
    const worker = await workerRepository.create({
      name: data.name,
      email: data.email,
      position: data.position,
    });
    // darle rol 
    const role =
      await roleRepository.findByName("worker");
      if (!role) {
        throw new Error("Rol worker no encontrado");
      }
    // Crear invitación
    const token = generateInviteToken();
    // Crear registro de invitación
    const invitation =
      await invitationRepository.create({
        email: data.email,
        token,
        roleId: role.id,
        workerId: worker.id,
        expiresAt: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ),
      });
      // Enviar email de invitación
      const inviteLink =
        `${process.env.FRONTEND_URL}/invite/${token}`;

      await sendEmail({
        to: data.email,
        subject: "Invitación a Workers SaaS",
        html: `
          <h2>Bienvenido a Workers SaaS</h2>

          <p>Has sido invitado al sistema.</p>

          <p>
            Haz clic aquí para crear tu cuenta:
          </p>

          <a href="${inviteLink}">
            Crear cuenta
          </a>

          <p>El enlace expira en 2 días.</p>
        `,
      });
      // Registrar logs
      await activityLogsRepository.create({
        userId: user.id,
        action: "WORKER_CREATED",
        resource: "worker",
        resourceId: worker.id,
        ip,
      });
      // Registrar auditoría  
      await auditTrailRepository.create({
        userId: user.id,
        action: "CREATED_WORKER", 
        resource: "worker",
        resourceId: worker.id,
        before: null,
        after: worker,
        ip: null,
      });
      return {
        mesage: "Trabajador creado e invitación enviada",
        worker,
      }
     /*try {
      await auditTrailRepository.create({
        userId: user.id,
        action: "CREATED_WORKER",
        resource: "worker",
        resourceId: worker.id,
        before: null,
        after: worker,
        ip: null,
      });
    } catch (error) {
      console.error("AUDIT ERROR:", error);
      throw error;
    }
    return {
      menssage: "Trabajador creado e invitación enviada",
      worker,
     };*/ // este bloque es para ver que falla en los test y ver el error en la consola solo se habilita si falla la prueba, si pasa se inavilita para no llenar la consola de logs

  },
  

  async updateWorker({ id, data, user, ip }) {

    const before =
      await this.getWorkerById(id);

    const updatedWorker =
      await workerRepository.update(id, {
        name: data.name,
        email: data.email,
        position: data.position,
      });

    await activityLogsRepository.create({
      userId: user.id,
      action: "WORKER_UPDATED",
      resource: "worker",
      resourceId: id,
      ip,
    });

    await auditTrailRepository.create({
      userId: user.id,
      action: "WORKER_UPDATED",
      resource: "worker",
      resourceId: id,
      before,
      after: updatedWorker,
    });

    return updatedWorker;
  },

  async deleteWorker({ id, user, ip }) {

    const before =
      await this.getWorkerById(id);

    const worker =
      await workerRepository.deactivate(id);

    await activityLogsRepository.create({
      userId: user.id,
      action: "WORKER_DELETED",
      resource: "worker",
      resourceId: id,
      ip,
    });

    await auditTrailRepository.create({
      userId: user.id,
      action: "WORKER_DELETED",
      resource: "worker",
      resourceId: id,
      before,
      after: worker,
    });

    return {
      message: "Worker desactivado",
      worker,
    };
  }
};