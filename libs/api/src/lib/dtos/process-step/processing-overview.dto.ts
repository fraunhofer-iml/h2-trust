import { ProcessStepEntity } from '@h2-trust/amqp';

export class ProcessingOverviewDto {
  id: string;
  timestamp: Date;
  owner?: string;
  filledAmount?: number;
  color?: string;

  constructor(id: string, timestamp: Date, owner: string, filledAmount: number, color: string) {
    this.id = id;
    this.timestamp = timestamp;
    this.owner = owner;
    this.filledAmount = filledAmount;
    this.color = color;
  }

  static fromEntity(processStep: ProcessStepEntity): ProcessingOverviewDto {
    return <ProcessingOverviewDto>{
      id: processStep.id,
      timestamp: processStep.endedAt,
      owner: processStep.batch?.owner?.name,
      filledAmount: processStep.batch?.amount,
      color: processStep.batch?.quality,
    };
  }
}
