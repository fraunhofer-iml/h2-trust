import { Prisma } from '@prisma/client';
import { baseUnitResultFields } from '../queries/unit.queries';

export type BaseUnitDbType = Prisma.UnitGetPayload<typeof baseUnitResultFields>;
