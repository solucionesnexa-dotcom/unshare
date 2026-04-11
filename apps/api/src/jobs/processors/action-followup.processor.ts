import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('action.followup')
export class ActionFollowupProcessor extends WorkerHost {
  private readonly logger = new Logger(ActionFollowupProcessor.name);

  async process(job: Job) {
    // TODO: Implementar lógica real de seguimiento de acciones
    // - Obtener acciones pendientes de seguimiento
    // - Verificar estado de plataformas (escaladas, eliminaciones)
    // - Actualizar estado de acciones en BD
    // - Generar reportes de resultados
    this.logger.warn(`[TODO] Action followup processor stub: job ${job.id}`);
    return { ok: true, id: job.id, status: 'pending_implementation' };
  }
}
