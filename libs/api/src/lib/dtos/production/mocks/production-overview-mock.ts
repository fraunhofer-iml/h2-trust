import { ProductionOverviewDto } from '../production-overview.dto';

export const PRODUCTIONOVERVIEWMOCK = [
  <ProductionOverviewDto>{
    startedOn: new Date('2025-01-19').toISOString(),
    endedOn: new Date('2025-01-20').toISOString(),
    productionUnit: 'Hydrogen Generator 3000',
    producedAmount: 15,
    color: 'GREEN',
    powerProducer: 'PowerGen AG',
    powerConsumed: 20,
    energySource: 'Wind Turbine',
  },
  <ProductionOverviewDto>{
    startedOn: new Date('2025-01-18').toISOString(),
    endedOn: new Date('2025-01-19').toISOString(),
    productionUnit: 'Hydrogen Generator 3000',
    producedAmount: 44,
    color: 'GREEN',
    powerProducer: 'PowerGen AG',
    powerConsumed: 32,
    energySource: 'Wind Turbine',
  },
];
