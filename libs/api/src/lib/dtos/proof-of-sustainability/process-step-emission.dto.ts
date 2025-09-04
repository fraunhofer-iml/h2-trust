import { EmissionProcessStepType } from '../../types';

export class EmissionForProcessStepDto {
  amount: number;
  name: string;
  description: string;
  processStepType: EmissionProcessStepType;

  constructor(amount: number, name: string, description: string, processStepType: EmissionProcessStepType) {
    this.amount = amount;
    this.name = name;
    this.description = description;
    this.processStepType = processStepType;
  }
}
