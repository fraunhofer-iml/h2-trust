import { HydrogenColor, PowerProductionUnitType } from '@prisma/client';

export const PowerProductionUnitTypeSeed = <PowerProductionUnitType[]>[
  {
    name: 'PHOTOVOLTAIC_SYSTEM',
    energySource: 'SOLAR_ENERGY',
    hydrogenColor: HydrogenColor.GREEN,
  },
  {
    name: 'WIND_TURBINE',
    energySource: 'WIND_ENERGY',
    hydrogenColor: HydrogenColor.GREEN,
  },
  {
    name: 'HYDROPOWER_PLANT',
    energySource: 'HYDROPOWER',
    hydrogenColor: HydrogenColor.GREEN,
  },
  {
    name: 'BIOGAS_PLANT',
    energySource: 'BIOMASS',
    hydrogenColor: HydrogenColor.ORANGE,
  },
  {
    name: 'BIOMASS_COGENERATION_PLANT',
    energySource: 'BIOMASS',
    hydrogenColor: HydrogenColor.ORANGE,
  },
  {
    name: 'NUCLEAR_POWER_PLANT',
    energySource: 'NUCLEAR_ENERGY',
    hydrogenColor: HydrogenColor.PINK,
  },
  {
    name: 'HARD_COAL_POWER_PLANT',
    energySource: 'FOSSIL_FUELS',
    hydrogenColor: HydrogenColor.YELLOW,
  },
  {
    name: 'LIGNITE_POWER_PLANT',
    energySource: 'FOSSIL_FUELS',
    hydrogenColor: HydrogenColor.YELLOW,
  },
  {
    name: 'OIL_FIRED_POWER_PLANT',
    energySource: 'FOSSIL_FUELS',
    hydrogenColor: HydrogenColor.YELLOW,
  },
  {
    name: 'NATURAL_GAS_POWER_PLANT',
    energySource: 'MINE_GAS',
    hydrogenColor: HydrogenColor.YELLOW,
  },
  {
    name: 'GEOTHERMAL_POWER_PLANT',
    energySource: 'GEOTHERMAL_ENERGY',
    hydrogenColor: HydrogenColor.YELLOW,
  },
  {
    name: 'GRID',
    energySource: 'Grid',
    hydrogenColor: HydrogenColor.YELLOW,
  },
];
