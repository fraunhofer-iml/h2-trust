import { ProcessStep } from '@prisma/client';
import { BottlingProcessSteps } from './process-steps/process-steps-bottling';
import { HydrogenProductionProcessSteps } from './process-steps/process-steps-hydrogen-production';
import { PowerProductionProcessSteps } from './process-steps/process-steps-power-production';

export const ProcessSteps = <ProcessStep[]>[
  ...PowerProductionProcessSteps,
  ...HydrogenProductionProcessSteps,
  ...BottlingProcessSteps,
];
