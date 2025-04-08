import { Prisma } from '@prisma/client';
import { hydrogenStorageUnitResultFields } from '../queries/unit.queries';

export type HydrogenStorageUnitDbType = Prisma.UnitGetPayload<typeof hydrogenStorageUnitResultFields>;
