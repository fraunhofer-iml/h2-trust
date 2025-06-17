import { ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessingOverviewDto } from './processing-overview.dto';

export class ProductPassDto extends ProcessingOverviewDto {
  producer?: string;

  constructor(id: string, timestamp: Date, owner: string, filledAmount: number, color: string, producer: string) {
    super(id, timestamp, owner, filledAmount, color);
    this.producer = producer;
  }

  static fromEntityToDto(processStep: ProcessStepEntity): ProductPassDto {
    return <ProductPassDto>{
      id: processStep.id,
      filledAt: processStep.endedAt,
      owner: processStep.batch?.owner?.name,
      filledAmount: processStep.batch?.amount,
      color: processStep.batch?.quality,
      producer: processStep.recordedBy?.id,
    };
  }
}
