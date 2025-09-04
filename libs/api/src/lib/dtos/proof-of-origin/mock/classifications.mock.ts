import { ClassificationDto } from '../classification.dto';
import { hydrogenBatchesMock } from './hydrogen-batches.mock';
import { PowerBatchesMock } from './power-batches.mock';

export const powerTypeClassificationsMock: ClassificationDto[] = [
  {
    amount: 60,
    amountVerified: 30,
    batches: [PowerBatchesMock[0], PowerBatchesMock[1]],
    classifications: [],
    emissionOfProcessStep: 260,
    name: 'WIND_ENERGY',
    classificationType: 'POWER',
    unit: 'kWh',
  },
  {
    amount: 60,
    amountVerified: 30,
    batches: [PowerBatchesMock[2], PowerBatchesMock[3]],
    classifications: [],
    emissionOfProcessStep: 260,
    name: 'SOLAR_ENERGY',
    classificationType: 'POWER',
    unit: 'kWh',
  },
];

export const powerSupplyClassificationsMock: ClassificationDto[] = [
  {
    amount: 60,
    amountVerified: 30,
    batches: [],
    classifications: powerTypeClassificationsMock,
    emissionOfProcessStep: 260,
    name: 'POWER SUPPLY',
    classificationType: 'POWER',
    unit: 'kWh',
  },
];

export const hydrogenColorClassificationsMock: ClassificationDto[] = [
  {
    amount: 400,
    amountVerified: 400,
    batches: [hydrogenBatchesMock[0], hydrogenBatchesMock[1]],
    classifications: [],
    emissionOfProcessStep: 260,
    name: 'GREEN',
    classificationType: 'HYDROGEN',
    unit: 'kg',
  },
  {
    amount: 300,
    amountVerified: 0,
    batches: [hydrogenBatchesMock[2]],
    classifications: [],
    emissionOfProcessStep: 260,
    name: 'PINK',
    classificationType: 'HYDROGEN',
    unit: 'kg',
  },
];
