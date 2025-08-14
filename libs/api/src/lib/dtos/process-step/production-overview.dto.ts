import { ProcessStepEntity } from '@h2-trust/amqp';
import { BatchType } from '../../enums';
import { parseColor } from '../util';

export class ProductionOverviewDto {
  startedAt: string;
  endedAt: string;
  productionUnit: string;
  producedAmount: number;
  color: string;
  powerProducer: string;
  powerConsumed: number;
  storageUnit: string;

  constructor(
    startedAt: string,
    endedAt: string,
    productionUnit: string,
    producedAmount: number,
    color: string,
    powerProducer: string,
    powerConsumed: number,
    storageUnit: string,
  ) {
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.productionUnit = productionUnit;
    this.producedAmount = producedAmount;
    this.color = color;
    this.powerProducer = powerProducer;
    this.powerConsumed = powerConsumed;
    this.storageUnit = storageUnit;
  }

  static fromEntity(processStep: ProcessStepEntity): ProductionOverviewDto {
    return <ProductionOverviewDto>{
      startedAt: processStep.startedAt.toString(),
      endedAt: processStep.endedAt.toString(),
      productionUnit: processStep.executedBy?.name,
      producedAmount: processStep.batch?.amount,
      color: parseColor(processStep.batch?.quality),
      powerProducer: processStep.batch?.predecessors?.[0]?.owner?.name,
      powerConsumed: ProductionOverviewDto.determinePowerConsumed(processStep),
      storageUnit: processStep.batch?.hydrogenStorageUnit?.name,
    };
  }

  private static determinePowerConsumed(processStep: ProcessStepEntity) {
    // NOTE: In the future, a batch could also have several predecessors
    if (processStep.batch?.predecessors?.[0]?.type !== BatchType.POWER) {
      return null;
    }
    return processStep.batch?.predecessors?.[0]?.amount;
  }
}
