import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('case.sla.reminder')
export class SlaReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(SlaReminderProcessor.name);

  async process(job: Job) {
    // TODO: Implementar lógica real de recordatorios SLA
    // - Obtener casos con SLA próximo a vencer
    // - Generar recordatorio para investigadores
    // - Actualizar estado de casos si SLA vence
    // - Enviar notificación a partes interesadas
    this.logger.warn(`[TODO] SLA reminder processor stub: job ${job.id}`);
    return { ok: true, id: job.id, status: 'pending_implementation' };
  }
}
