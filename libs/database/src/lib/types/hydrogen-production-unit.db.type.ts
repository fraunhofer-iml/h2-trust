import { Prisma } from '@prisma/client';
import { hydrogenProductionUnitResultFields } from '../queries/unit.queries';

export type HydrogenProductionUnitDbType = Prisma.UnitGetPayload<typeof hydrogenProductionUnitResultFields>;
