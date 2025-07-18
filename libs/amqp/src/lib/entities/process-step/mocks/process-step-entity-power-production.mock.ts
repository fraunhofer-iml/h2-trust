import { ProcessStepPowerProductionSeed } from 'libs/database/src/seed';
import { BatchEntityPowerProducedMock } from '../../batch/mocks';
import { DocumentEntityMock } from '../../document/mocks';
import { PowerProductionUnitEntityMock } from '../../unit/mocks';
import { UserEntityPowerMock } from '../../user/mocks';
import { ProcessStepEntity } from '../process-step.entity';

export const ProcessStepEntityPowerProductionMock: ProcessStepEntity[] = ProcessStepPowerProductionSeed.map(
  (seed, index) =>
    new ProcessStepEntity(
      seed.id,
      seed.startedAt,
      seed.endedAt,
      seed.processTypeName,
      BatchEntityPowerProducedMock[index],
      UserEntityPowerMock,
      PowerProductionUnitEntityMock[0],
      DocumentEntityMock,
    ),
);
