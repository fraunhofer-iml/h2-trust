import { ProcessType } from '@prisma/client';

export const ProcessTypeSeed = <ProcessType[]>[
  {
    name: 'POWER_PRODUCTION',
  },
  {
    name: 'HYDROGEN_PRODUCTION',
  },
  {
    name: 'HYDROGEN_BOTTLING',
  },
  {
    name: 'HYDROGEN_TRANSPORTATION',
  },
];
