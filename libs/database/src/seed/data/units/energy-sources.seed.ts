import { EnergySource } from '@prisma/client';

export const EnergySourcesSeed = <EnergySource[]>[
  {
    name: 'BIOMASS',
  },
  {
    name: 'FOSSIL_FUELS',
  },
  {
    name: 'GEOTHERMAL_ENERGY',
  },
  {
    name: 'HYDROPOWER',
  },
  {
    name: 'MINE_GAS',
  },
  {
    name: 'NUCLEAR_ENERGY',
  },
  {
    name: 'SOLAR_ENERGY',
  },
  {
    name: 'WIND_ENERGY',
  },
];
