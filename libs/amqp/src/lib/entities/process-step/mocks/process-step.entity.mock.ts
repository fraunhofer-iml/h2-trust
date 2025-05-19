// eslint-disable-next-line @nx/enforce-module-boundaries
import { Companies, HydrogenProductionProcessSteps, ProducedHydrogenBatches } from '@h2-trust/database';
import { ProcessStepEntity } from '../process-step.entity';

export const ProcessStepEntitiesMock = <ProcessStepEntity[]>[
  ...ProducedHydrogenBatches.map((batch) => ({
    ...batch,
    amount: batch.amount.toNumber(),
    owner: Companies[1],
  }))
    .map(batch => ({
      ...HydrogenProductionProcessSteps[0],
      executedBy: {
        id: HydrogenProductionProcessSteps[0].unitId,
      },
      batch: batch,
    }))
];
