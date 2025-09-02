import { HydrogenProductionType } from '@prisma/client';

export const HydrogenProductionTypeSeed = <HydrogenProductionType[]>[
  {
    id: 'ael',
    method: 'Electrolysis',
    technology: 'Alkaline Electrolysis (AEL)',
  },
  {
    id: 'aem',
    method: 'Electrolysis',
    technology: 'Anion Exchange Membrane (AEM)',
  },
  {
    id: 'pem',
    method: 'Electrolysis',
    technology: 'Proton Exchange Membrane (PEM)',
  },
  {
    id: 'soec',
    method: 'Electrolysis',
    technology: 'Solid Oxide Electrolysis Cell (SOEC)',
  },
];
