import { ProcessStepHydrogenProductionSeed } from 'libs/database/src/seed';
import { BatchEntityHydrogenProducedMock } from '../../batch/mocks';
import { DocumentEntityMock } from '../../document/mocks';
import { HydrogenProductionUnitEntityMock } from '../../unit/mocks';
import { UserEntityHydrogenMock } from '../../user/mocks';
import { ProcessStepEntity } from '../process-step.entity';

export const ProcessStepEntityHydrogenProductionMock: ProcessStepEntity[] = ProcessStepHydrogenProductionSeed.map(
  (seed, index) =>
    new ProcessStepEntity(
      seed.id,
      seed.startedAt,
      seed.endedAt,
      seed.processTypeName,
      BatchEntityHydrogenProducedMock[index],
      UserEntityHydrogenMock,
      HydrogenProductionUnitEntityMock[0],
      DocumentEntityMock,
    ),
);
