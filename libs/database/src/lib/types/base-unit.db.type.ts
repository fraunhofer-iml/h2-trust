import { Prisma } from '@prisma/client';
import { baseUnitResultFields } from '../queries';

export type BaseUnitDbType = Prisma.UnitGetPayload<typeof baseUnitResultFields>;
