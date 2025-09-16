import { EmissionForProcessStepDto } from '../process-step-emission.dto';

export const processStepEmissionsMock: EmissionForProcessStepDto[] = [
  { amount: 20, description: 'Transport Emissions', name: 'Et', processStepType: 'APPLICATION' },
  { amount: 45, description: 'Bottling Emissions', name: 'Eb', processStepType: 'APPLICATION' },
  { amount: 17, description: 'Power Production Emissions', name: 'Epp', processStepType: 'APPLICATION' },
  { amount: 4.15, description: 'Water Supply Emissions', name: 'Ew', processStepType: 'APPLICATION' },

  { amount: 20, description: 'Emissions from transport and distribution', name: 'Etd', processStepType: 'REGULATORY' },
  {
    amount: 66.15,
    description: 'Processing emissions',
    name: 'Ep',
    processStepType: 'REGULATORY',
  },
];
