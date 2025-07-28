import { WaterBatchDto } from '../batch.dto';
import { WaterDetailsDto } from '../water-details.dto';
import { EmissionMock } from './emissions.mock';

const waterDetailsMock: WaterDetailsDto[] = [
  {
    amount: 100,
    emission: 43,
    emissionCalculation: ' E =  n * 0.43 ',
  },
  {
    amount: 100,
    emission: 20,
    emissionCalculation: ' E =  n * 0.2 ',
  },
  {
    amount: 100,
    emission: 36367,
    emissionCalculation: ' E =  n * 363.67 ',
  },
];

export const waterBatchMock: WaterBatchDto = {
  id: 'water-batch-1',
  amount: 300,
  unit: 'l',
  createdAt: new Date(),
  deionizedWater: waterDetailsMock[0],
  tapWater: waterDetailsMock[1],
  wasteWater: waterDetailsMock[2],
  emission: EmissionMock,
};
