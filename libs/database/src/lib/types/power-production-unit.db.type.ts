import { Prisma } from '@prisma/client';
import { powerProductionUnitResultFields } from '../queries';

export type PowerProductionUnitDbType = Prisma.UnitGetPayload<typeof powerProductionUnitResultFields>;
