import { ProcessStepHydrogenBottlingSeed } from 'libs/database/src/seed';
import { BatchEntityHydrogenBottledMock } from '../../batch/mocks';
import { DocumentEntityMock } from '../../document/mocks';
import { HydrogenStorageUnitEntityMock } from '../../unit/mocks';
import { UserEntityHydrogenMock } from '../../user/mocks';
import { ProcessStepEntity } from '../process-step.entity';

export const ProcessStepEntityHydrogenBottlingMock: ProcessStepEntity[] = ProcessStepHydrogenBottlingSeed.map(
  (seed, index) =>
    new ProcessStepEntity(
      seed.id,
      seed.startedAt,
      seed.endedAt,
      seed.processTypeName,
      BatchEntityHydrogenBottledMock[index],
      UserEntityHydrogenMock,
      HydrogenStorageUnitEntityMock[0],
      DocumentEntityMock,
    ),
);
