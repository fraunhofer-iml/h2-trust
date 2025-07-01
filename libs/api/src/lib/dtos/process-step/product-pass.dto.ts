import { ProcessStepEntity } from '@h2-trust/amqp';
import { ColorPortionDto } from './color-portion.dto';
import { ProcessingOverviewDto } from './processing-overview.dto';

export class ProductPassDto extends ProcessingOverviewDto {
  producer?: string;
  hydrogenComposition: ColorPortionDto[];

  constructor(
    id: string,
    timestamp: Date,
    owner: string,
    filledAmount: number,
    color: string,
    producer: string,
    hydrogenComposition: ColorPortionDto[],
  ) {
    super(id, timestamp, owner, filledAmount, color);
    this.producer = producer;
    this.hydrogenComposition = hydrogenComposition;
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
