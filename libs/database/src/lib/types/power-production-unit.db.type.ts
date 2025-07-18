import { Prisma } from '@prisma/client';
import { powerProductionUnitResultFields } from '../result-fields';

export type PowerProductionUnitDbType = Prisma.UnitGetPayload<typeof powerProductionUnitResultFields>;
