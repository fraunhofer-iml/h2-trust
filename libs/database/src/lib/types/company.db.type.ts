import { Prisma } from '@prisma/client';
import { companyResultFields } from '../result-fields';

export type CompanyDbType = Prisma.CompanyGetPayload<typeof companyResultFields>;
