import { ProcessStep } from '@prisma/client';
import { ProcessStepHydrogenBottlingSeed } from './process-step-hydrogen-bottling.seed';
import { ProcessStepHydrogenProductionSeed } from './process-step-hydrogen-production.seed';
import { ProcessStepPowerProductionSeed } from './process-step-power-production.seed';

export const ProcessStepSeed = <ProcessStep[]>[
  ...ProcessStepPowerProductionSeed,
  ...ProcessStepHydrogenProductionSeed,
  ...ProcessStepHydrogenBottlingSeed,
];
