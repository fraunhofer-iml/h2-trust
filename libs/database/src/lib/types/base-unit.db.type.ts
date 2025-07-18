import { Prisma } from '@prisma/client';
import { baseUnitResultFields } from '../result-fields';

export type BaseUnitDbType = Prisma.UnitGetPayload<typeof baseUnitResultFields>;
