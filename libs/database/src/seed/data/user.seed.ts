import { User } from '@prisma/client';
import { CompanySeed } from './company.seed';

export const UserSeed = <User[]>[
  {
    id: 'user-power-1',
    name: 'Petra Power',
    email: 'petra@power.de',
    companyId: CompanySeed[0].id,
  },
  {
    id: '6f63a1a9-6cc5-4a7a-98b2-79a0460910f4',
    name: 'Emil Hydrogen',
    email: 'emil@hydrogen.de',
    companyId: CompanySeed[1].id,
  },
  {
    id: 'f2872c58-ff19-4079-ad53-e04cd95b5a4a',
    name: 'Nick Hydrogen',
    email: 'nick@hydrogen.de',
    companyId: CompanySeed[1].id,
  },
];
