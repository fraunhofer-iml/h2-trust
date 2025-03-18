import { User } from '@prisma/client';

export const Users = <User[]>[
  {
    id: 'user-power-1',
    name: 'Petra Power',
    email: 'petra@power.de',
    companyId: 'company-power-1',
  },
  {
    id: 'user-hydrogen-1',
    name: 'Hans Hydrogen',
    email: 'hans@hydrogen.de',
    companyId: 'company-hydrogen-1',
  },
];
