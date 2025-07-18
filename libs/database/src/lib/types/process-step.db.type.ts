import { Prisma } from '@prisma/client';
import { processStepResultFields } from '../result-fields';

export type ProcessStepDbType = Prisma.ProcessStepGetPayload<typeof processStepResultFields>;
