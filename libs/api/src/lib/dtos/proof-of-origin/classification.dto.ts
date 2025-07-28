import { ClassificationType } from '../../types/classification-type.type';
import { BatchDto } from './batch.dto';

/**
 * Classifications for aggregation of batches or classifications
 * representing all levels in between sections and batches
 * @example power supply, grid power, green hydrogen
 */
export class ClassificationDto {
  name: string;
  emission: number;
  amount: number;
  amountVerified: number;
  batches: BatchDto[];
  classifications: ClassificationDto[];
  /**
   * measuring unit for amount
   */
  unit: string;
  classificationType: ClassificationType;

  constructor(
    name: string,
    emission: number,
    amount: number,
    amountVerified: number,
    batches: BatchDto[],
    classifications: ClassificationDto[],
    unit: string,
    type: ClassificationType,
  ) {
    this.name = name;
    this.emission = emission;
    this.amount = amount;
    this.amountVerified = amountVerified;
    this.batches = batches;
    this.classifications = classifications;
    this.unit = unit;
    this.classificationType = type;
  }
}
