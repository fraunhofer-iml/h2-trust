import { Prisma } from '@prisma/client';
import { hydrogenProductionUnitResultFields } from '../result-fields';

export type HydrogenProductionUnitDbType = Prisma.UnitGetPayload<typeof hydrogenProductionUnitResultFields>;
