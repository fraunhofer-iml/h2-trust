import { HttpStatus, Injectable } from '@nestjs/common';
import { HydrogenColor } from '@prisma/client';
import { BrokerException, ProcessStepEntity } from '@h2-trust/amqp';
import { parseColor, ProcessType } from '@h2-trust/api';
import {
  BatchRepository,
  BatchTypeDbEnum,
  DocumentRepository,
  HydrogenColorDbEnum,
  ProcessStepRepository
} from '@h2-trust/database';
import { StorageService } from '@h2-trust/storage';

@Injectable()
export class BottlingService {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly processStepRepository: ProcessStepRepository,
    private readonly storageService: StorageService,
  ) {}

  async executeBottling(processStep: ProcessStepEntity, file: Express.Multer.File): Promise<ProcessStepEntity> {
    this.validateProcessStep(processStep);

    const allProcessStepsFromStorageUnit = await this.processStepRepository.findAllProcessStepsFromStorageUnit(
      processStep.executedBy.id,
    );

    if (allProcessStepsFromStorageUnit.length === 0) {
      throw new BrokerException(
        `No batches found in storage unit ${processStep.executedBy.id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { processStepsForBottle, remainingHydrogenAmount } =
      this.pickBatchesForBottleAndCalculateRemainingBatchAmount(
        allProcessStepsFromStorageUnit,
        processStep.batch.amount,
        processStep.executedBy.id,
      );

    const bottlingProcessStep = await this.createBottlingProcessStep(processStep, processStepsForBottle);

    if (remainingHydrogenAmount > 0) {
      await this.createHydrogenProductionProcessStepForRemainingBatchAmount(
        processStep,
        remainingHydrogenAmount,
        processStepsForBottle[0].batch.owner.id,
        processStepsForBottle.at(-1),
      );
    }
    await this.batchRepository.setBatchesInactive(processStepsForBottle.map((processStep) => processStep.batch.id));

    if (file) {
      await this.addDocumentToProcessStep(file, bottlingProcessStep.id, processStep.documents[0]?.description);
    }

    return this.processStepRepository.findProcessStep(bottlingProcessStep.id);
  }

  private validateProcessStep(processStep: ProcessStepEntity): void {
    if (!processStep.executedBy.id) {
      throw new BrokerException(`No storage unit for hydrogen extraction specified`, HttpStatus.BAD_REQUEST);
    }

    if (!processStep.batch || isNaN(Number(processStep.batch.amount)) || Number(processStep.batch.amount) <= 0) {
      throw new BrokerException(
        `No valid hydrogen amount specified: (${processStep.batch?.amount})`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private pickBatchesForBottleAndCalculateRemainingBatchAmount(
    allProcessStepsFromStorageUnit: ProcessStepEntity[],
    bottleCapacity: number,
    storageUnitId: string,
  ) {
    const processStepsForBottle: ProcessStepEntity[] = [];
    let requiredHydrogenAmount = bottleCapacity;
    let remainingHydrogenAmount: number;

    for (const processStepFromStorageUnit of allProcessStepsFromStorageUnit) {
      processStepsForBottle.push(processStepFromStorageUnit);

      if (processStepFromStorageUnit.batch.amount >= requiredHydrogenAmount) {
        remainingHydrogenAmount = processStepFromStorageUnit.batch.amount - requiredHydrogenAmount;
        requiredHydrogenAmount = 0;
        break;
      }

      requiredHydrogenAmount -= processStepFromStorageUnit.batch.amount;
    }

    if (requiredHydrogenAmount !== 0) {
      const message = `There is not enough hydrogen in storage unit ${storageUnitId} for the requested amount of ${bottleCapacity}`;
      throw new BrokerException(message, HttpStatus.BAD_REQUEST);
    }

    return { processStepsForBottle, remainingHydrogenAmount };
  }

  private async createBottlingProcessStep(
    processStep: ProcessStepEntity,
    processStepsForBottle: ProcessStepEntity[],
  ): Promise<ProcessStepEntity> {
    return this.processStepRepository.insertProcessStep(
      {
        ...processStep,
        processType: ProcessType.BOTTLING,
        batch: {
          amount: processStep.batch.amount,
          quality: this.determineBottleQualityFromPredecessors(processStepsForBottle),
          type: BatchTypeDbEnum.HYDROGEN,
          owner: {
            id: processStep.batch.owner.id,
          },
        },
      },
      processStepsForBottle.map((processStep) => processStep.batch.id),
    );
  }

  // NOTE: The timestamps here were set to those of the “tapped” batch.
  // This places the newly created “remaining” batch at the beginning of the storage batch queue.
  // This seems to contradict the first-in-first-out principle,
  // but in fact a batch is now tapped before all others until it is empty.
  private async createHydrogenProductionProcessStepForRemainingBatchAmount(
    processStep: ProcessStepEntity,
    remainingAmount: number,
    ownerId: string,
    predecessorProcessStep: ProcessStepEntity,
  ): Promise<ProcessStepEntity> {
    return this.processStepRepository.insertProcessStep(
      {
        ...processStep,
        startedAt: predecessorProcessStep.startedAt,
        endedAt: predecessorProcessStep.endedAt,
        processType: ProcessType.HYDROGEN_PRODUCTION,
        batch: {
          amount: remainingAmount,
          quality: predecessorProcessStep.batch.quality,
          type: BatchTypeDbEnum.HYDROGEN,
          owner: {
            id: ownerId,
          },
          hydrogenStorageUnitId: processStep.executedBy.id,
        },
      },
      [predecessorProcessStep.batch.id],
    );
  }

  private async addDocumentToProcessStep(file: Express.Multer.File, processStepId: string, description: string) {
    const fileName = await this.storageService.uploadFileWithDeepPath(file, `process-step`, processStepId);
    return this.documentRepository.addDocumentToProcessStep(
      {
        description: description,
        location: fileName,
      },
      processStepId,
    );
  }

  private determineBottleQualityFromPredecessors(predecessors: ProcessStepEntity[]): string {
    const colors: HydrogenColorDbEnum[] = predecessors
      .map((processEntity) => processEntity.batch.quality)
      .map(parseColor)
      .map((color) => HydrogenColorDbEnum[color as keyof typeof HydrogenColorDbEnum]);
    return JSON.stringify({
      color: this.determineBottleColorFromPredecessors(colors),
    });
  }

  private determineBottleColorFromPredecessors(colors: HydrogenColor[]): HydrogenColor {
    if (colors.length === 0) {
      throw new BrokerException(`No predecessor colors specified`, HttpStatus.BAD_REQUEST);
    }
    const firstColor = colors[0];
    const allColorsAreEqual = colors.every((color) => color === firstColor);

    return allColorsAreEqual
      ? firstColor
      : HydrogenColor.MIX;
  }
}
