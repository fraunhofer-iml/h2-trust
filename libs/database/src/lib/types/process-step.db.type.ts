import { Prisma } from '@prisma/client';
import { processStepResultFields } from '../queries/process-step.queries';

export type ProcessStepDbType = Prisma.ProcessStepGetPayload<typeof processStepResultFields>;
