import { User } from '@prisma/client';

export const Users = <User[]>[
  {
    id: 'user-power',
    name: 'Petra Power',
    email: 'petra@power.de',
    walletId: 'w12345',
    companyId: 'company-power',
  },
  {
    id: 'user-hydrogen',
    name: 'Hans Hydrogen',
    email: 'hans@hydrogen.de',
    walletId: 'w67890',
    companyId: 'company-hydrogen',
  },
];
