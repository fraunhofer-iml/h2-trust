import { ProcessType } from '@prisma/client';

export const ProcessTypesSeed = <ProcessType[]>[
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
