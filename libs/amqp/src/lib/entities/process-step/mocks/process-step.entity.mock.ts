import { CompaniesSeed, ProcessStepsHydrogenProductionSeed, HydrogenBatchesProducedSeed } from '@h2-trust/database';
import { ProcessStepEntity } from '../process-step.entity';

export const ProcessStepEntitiesMock = <ProcessStepEntity[]>[
  ...HydrogenBatchesProducedSeed.map((batch) => ({
    ...batch,
    amount: batch.amount.toNumber(),
    owner: CompaniesSeed[1],
  }))
    .map(batch => ({
      ...ProcessStepsHydrogenProductionSeed[0],
      executedBy: {
        id: ProcessStepsHydrogenProductionSeed[0].unitId,
      },
      batch: batch,
    }))
];
