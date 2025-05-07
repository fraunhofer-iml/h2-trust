import { Prisma } from '@prisma/client';
import { processStepResultFields } from '../queries';

export type ProcessStepDbType = Prisma.ProcessStepGetPayload<typeof processStepResultFields>;
