import { User } from '@prisma/client';

export const Users = <User[]>[
  {
    id: 'user-power-1',
    name: 'Petra Power',
    email: 'petra@power.de',
    companyId: 'company-power-1',
  },
  {
    id: '6f63a1a9-6cc5-4a7a-98b2-79a0460910f4',
    name: 'Emil Hydrogen',
    email: 'emil@hydrogen.de',
    companyId: 'company-hydrogen-1',
  },
];
