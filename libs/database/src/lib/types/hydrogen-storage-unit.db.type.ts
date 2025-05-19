import { Prisma } from '@prisma/client';
import { hydrogenStorageUnitResultFields } from '../queries';

export type HydrogenStorageUnitDbType = Prisma.UnitGetPayload<typeof hydrogenStorageUnitResultFields>;
