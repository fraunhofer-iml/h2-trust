import { Prisma } from '@prisma/client';
import { hydrogenStorageUnitResultFields } from '../result-fields';

export type HydrogenStorageUnitDbType = Prisma.UnitGetPayload<typeof hydrogenStorageUnitResultFields>;
