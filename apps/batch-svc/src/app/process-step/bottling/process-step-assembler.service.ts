import { HttpStatus, Injectable } from '@nestjs/common';
import { BatchEntity, BrokerException, ProcessStepEntity } from '@h2-trust/amqp';
import { parseColor, ProcessType } from '@h2-trust/api';
import { BatchTypeDbEnum, HydrogenColorDbEnum, ProcessStepRepository } from '@h2-trust/database';

@Injectable()
export class ProcessStepAssemblerService {
  constructor(private readonly processStepRepository: ProcessStepRepository) {}

  async createBottlingProcessStep(
    processStep: ProcessStepEntity,
    batchesForBottle: BatchEntity[],
  ): Promise<ProcessStepEntity> {
    return this.processStepRepository.insertProcessStep({
      ...processStep,
      processType: ProcessType.HYDROGEN_BOTTLING,
      batch: {
        amount: processStep.batch.amount,
        quality: this.determineBottleQualityFromPredecessors(batchesForBottle),
        type: BatchTypeDbEnum.HYDROGEN,
        predecessors: batchesForBottle.map((batch) => ({
          id: batch.id,
        })),
        owner: {
          id: processStep.batch.owner.id,
        },
      },
    });
  }

  private determineBottleQualityFromPredecessors(predecessors: BatchEntity[]): string {
    const colors: HydrogenColorDbEnum[] = predecessors
      .map((batch) => batch.quality)
      .map(parseColor)
      .map((color) => HydrogenColorDbEnum[color as keyof typeof HydrogenColorDbEnum]);
    return JSON.stringify({
      color: this.determineBottleColorFromPredecessors(colors),
    });
  }

  private determineBottleColorFromPredecessors(colors: HydrogenColorDbEnum[]): HydrogenColorDbEnum {
    if (colors.length === 0) {
      throw new BrokerException(`No predecessor colors specified`, HttpStatus.BAD_REQUEST);
    }
    const firstColor = colors[0];
    const allColorsAreEqual = colors.every((color) => color === firstColor);

    return allColorsAreEqual ? firstColor : HydrogenColorDbEnum.MIX;
  }

  // NOTE: The timestamps here were set to those of the “tapped” batch.
  // This places the newly created “remaining” batch at the beginning of the storage batch queue.
  // This seems to contradict the first-in-first-out principle,
  // but in fact a batch is now tapped before all others until it is empty.
  assembleHydrogenProductionProcessStepForRemainingAmount(
    processStep: ProcessStepEntity,
    remainingAmount: number,
    ownerId: string,
    predecessorProcessStep: ProcessStepEntity,
  ): ProcessStepEntity {
    return {
      ...processStep,
      startedAt: predecessorProcessStep.startedAt,
      endedAt: predecessorProcessStep.endedAt,
      processType: ProcessType.HYDROGEN_PRODUCTION,
      batch: {
        amount: remainingAmount,
        quality: predecessorProcessStep.batch.quality,
        type: BatchTypeDbEnum.HYDROGEN,
        predecessors: [
          {
            id: predecessorProcessStep.batch.id,
          },
        ],
        owner: {
          id: ownerId,
        },
        hydrogenStorageUnit: {
          id: processStep.executedBy?.id,
        },
      },
    };
  }
}
