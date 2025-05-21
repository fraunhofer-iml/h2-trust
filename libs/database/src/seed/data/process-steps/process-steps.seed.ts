import { ProcessStep } from '@prisma/client';
import { ProcessStepsBottlingSeed } from './process-steps-bottling.seed';
import { ProcessStepsHydrogenProductionSeed } from './process-steps-hydrogen-production.seed';
import { ProcessStepsPowerProductionSeed } from './process-steps-power-production.seed';

export const ProcessStepsSeed = <ProcessStep[]>[
  ...ProcessStepsPowerProductionSeed,
  ...ProcessStepsHydrogenProductionSeed,
  ...ProcessStepsBottlingSeed,
];
