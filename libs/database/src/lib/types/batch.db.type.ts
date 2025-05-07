import { Prisma } from '@prisma/client';
import { batchResultFields } from '../queries';

export type BatchDbType = Prisma.BatchGetPayload<typeof batchResultFields>;
