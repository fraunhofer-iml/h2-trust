import { ProcessStepEntity } from '@h2-trust/amqp';
import { FileInfoDto } from '../file/file-info.dto';
import { BottlingOverviewDto } from './bottling-overview.dto';
import { HydrogenComponentDto } from './hydrogen-component.dto';

export class ProductPassDto extends BottlingOverviewDto {
  producer?: string;
  product: string;
  hydrogenComposition: HydrogenComponentDto[];
  attachedFiles: FileInfoDto[];

  constructor(
    id: string,
    timestamp: Date,
    owner: string,
    filledAmount: number,
    color: string,
    producer: string,
    hydrogenComposition: HydrogenComponentDto[],
    attachedFiles: FileInfoDto[],
  ) {
    super(id, timestamp, owner, filledAmount, color);
    this.producer = producer;
    this.hydrogenComposition = hydrogenComposition;
    this.product = 'Hydrogen';
    this.attachedFiles = attachedFiles;
  }

  static fromEntityToDto(processStep: ProcessStepEntity): ProductPassDto {
    return <ProductPassDto>{
      id: processStep.id,
      filledAt: processStep.endedAt,
      owner: processStep.batch?.owner?.name,
      filledAmount: processStep.batch?.amount,
      color: processStep.batch?.quality,
      producer: processStep.recordedBy?.id,
      product: 'Hydrogen',
      attachedFiles:
        processStep.documents?.map((document) => new FileInfoDto(document.description, document.location)) || [],
    };
  }
}
