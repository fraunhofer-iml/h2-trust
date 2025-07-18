import { Prisma } from '@prisma/client';
import { batchResultFields } from '../result-fields';

export type BatchDbType = Prisma.BatchGetPayload<typeof batchResultFields>;
