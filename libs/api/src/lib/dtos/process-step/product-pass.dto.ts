import { ProcessStepEntity } from '@h2-trust/amqp';
import { BottlingOverviewDto } from './bottling-overview.dto';
import { HydrogenComponentDto } from './hydrogen-component.dto';

export class ProductPassDto extends BottlingOverviewDto {
  producer?: string;
  hydrogenComposition: HydrogenComponentDto[];

  constructor(
    id: string,
    timestamp: Date,
    owner: string,
    filledAmount: number,
    color: string,
    producer: string,
    hydrogenComposition: HydrogenComponentDto[],
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
