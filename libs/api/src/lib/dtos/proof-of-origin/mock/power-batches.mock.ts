import { EnergySource } from '../../../enums';
import { CompanyDtoMock } from '../../company';
import { PowerProductionUnitOverviewDtoMock } from '../../unit/mocks';
import { PowerBatchDto } from '../batch.dto';
import { EmissionMock } from './emissions.mock';

export const PowerBatchesMock: PowerBatchDto[] = [
  {
    id: 'power-batch-1-wind',
    amount: 30,
    unit: 'kWh',
    amountVerified: 20,
    accountingPeriodEnd: new Date(),
    createdAt: new Date(),
    emission: EmissionMock,
    energySource: EnergySource.WIND_ENERGY,
    producer: CompanyDtoMock[0].name,
    unitId: PowerProductionUnitOverviewDtoMock[0].id,
  },
  {
    id: 'power-batch-2-wind',
    amount: 30,
    unit: 'kWh',
    amountVerified: 20,
    accountingPeriodEnd: new Date(),
    createdAt: new Date(),
    emission: EmissionMock,
    energySource: EnergySource.WIND_ENERGY,
    producer: CompanyDtoMock[0].name,
    unitId: PowerProductionUnitOverviewDtoMock[0].id,
  },
  {
    id: 'power-batch-3-solar',
    amount: 30,
    unit: 'kWh',
    amountVerified: 20,
    accountingPeriodEnd: new Date(),
    createdAt: new Date(),
    emission: EmissionMock,
    energySource: EnergySource.SOLAR_ENERGY,
    producer: CompanyDtoMock[0].name,
    unitId: PowerProductionUnitOverviewDtoMock[0].id,
  },
  {
    id: 'power-batch-4-solar',
    amount: 30,
    unit: 'kWh',
    amountVerified: 20,
    accountingPeriodEnd: new Date(),
    createdAt: new Date(),
    emission: EmissionMock,
    energySource: EnergySource.SOLAR_ENERGY,
    producer: CompanyDtoMock[0].name,
    unitId: PowerProductionUnitOverviewDtoMock[0].id,
  },
];
