import { ProcessType } from '@prisma/client';

export const ProcessTypes = <ProcessType[]>[
  {
    name: 'POWER_PRODUCTION',
  },
  {
    name: 'HYDROGEN_PRODUCTION',
  },
  {
    name: 'BOTTLING',
  },
];
