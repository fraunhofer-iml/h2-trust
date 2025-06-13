import { User } from '@prisma/client';
import { CompaniesSeed } from './companies.seed';
import { getElementOrThrowError } from './utils';

export const UsersSeed = <User[]>[
  {
    id: 'user-power-1',
    name: 'Petra Power',
    email: 'petra@power.de',
    companyId: getElementOrThrowError(CompaniesSeed, 0, 'Company').id,
  },
  {
    id: '6f63a1a9-6cc5-4a7a-98b2-79a0460910f4',
    name: 'Emil Hydrogen',
    email: 'emil@hydrogen.de',
    companyId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
];
