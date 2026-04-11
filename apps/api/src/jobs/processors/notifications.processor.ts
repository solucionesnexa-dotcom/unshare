import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('notifications.send')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  async process(job: Job) {
    // TODO: Implementar lógica real de envío de notificaciones
    // - Obtener datos del job: destinatarios, plantilla, variables
    // - Enviar notificaciones por email/SMS/push según configuración
    // - Registrar resultado en audit log
    this.logger.warn(`[TODO] Notifications processor stub: job ${job.id}`);
    return { ok: true, id: job.id, status: 'pending_implementation' };
  }
}
