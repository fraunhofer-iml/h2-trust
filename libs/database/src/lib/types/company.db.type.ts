import { Prisma } from '@prisma/client';
import { companyResultFields } from '../queries';

export type CompanyDbType = Prisma.CompanyGetPayload<typeof companyResultFields>;
