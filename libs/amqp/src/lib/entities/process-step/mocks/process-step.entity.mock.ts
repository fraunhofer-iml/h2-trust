// eslint-disable-next-line @nx/enforce-module-boundaries
import { Companies, HydrogenProductionProcessSteps, ProducedHydrogenBatches } from '@h2-trust/database';
import { ProcessStepEntity } from '../process-step.entity';

export const ProcessStepEntitiesMock = <ProcessStepEntity[]>[
  {
    ...HydrogenProductionProcessSteps[0],
    batch: {
      ...ProducedHydrogenBatches[0],
      amount: ProducedHydrogenBatches[0].amount.toNumber(),
      owner: Companies[1],
    },
  },
];
