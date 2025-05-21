import { User } from '@prisma/client';
import { CompaniesSeed } from './companies.seed';

export const UsersSeed = <User[]>[
  {
    id: 'user-power-1',
    name: 'Petra Power',
    email: 'petra@power.de',
    companyId: CompaniesSeed[0].id,
  },
  {
    id: '6f63a1a9-6cc5-4a7a-98b2-79a0460910f4',
    name: 'Emil Hydrogen',
    email: 'emil@hydrogen.de',
    companyId: CompaniesSeed[1].id,
  },
];
