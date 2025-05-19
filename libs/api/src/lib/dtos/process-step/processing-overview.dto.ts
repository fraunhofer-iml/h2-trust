import { ProcessStepEntity } from '@h2-trust/amqp';
import { parseColor } from '../util';

export class ProcessingOverviewDto {
  id: string;
  filledAt: Date;
  owner?: string;
  filledAmount?: number;
  color?: string;

  constructor(id: string, filledAt: Date, owner: string, filledAmount: number, color: string) {
    this.id = id;
    this.filledAt = filledAt;
    this.owner = owner;
    this.filledAmount = filledAmount;
    this.color = color;
  }

  static fromEntity(processStep: ProcessStepEntity): ProcessingOverviewDto {
    return <ProcessingOverviewDto>{
      id: processStep.id,
      filledAt: processStep.endedAt,
      owner: processStep.batch?.owner?.name,
      filledAmount: processStep.batch?.amount,
      color: parseColor(processStep.batch?.quality),
    };
  }
}
