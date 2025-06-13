import { CompaniesSeed, HydrogenBatchesProducedSeed, ProcessStepsHydrogenProductionSeed } from 'libs/database/src/seed';
import { ProcessStepEntity } from '../process-step.entity';

export const ProcessStepEntitiesMock = <ProcessStepEntity[]>[
  ...HydrogenBatchesProducedSeed.map((batch) => ({
    ...batch,
    amount: batch.amount.toNumber(),
    owner: CompaniesSeed[1],
  })).map((batch) => ({
    ...ProcessStepsHydrogenProductionSeed[0],
    executedBy: {
      id: ProcessStepsHydrogenProductionSeed[0]?.unitId ?? '',
    },
    batch: batch,
  })),
];
