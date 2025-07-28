import { BatchDto } from './batch.dto';
import { ClassificationDto } from './classification.dto';

/**
 * top level sections of proof of origin
 * @example input media, bottling, sale etc.
 */
export class SectionDto {
  name: string;
  batches: BatchDto[];
  classifications: ClassificationDto[];

  constructor(name: string, batches: BatchDto[], classifications: ClassificationDto[]) {
    this.name = name;
    this.batches = batches;
    this.classifications = classifications;
  }
}
