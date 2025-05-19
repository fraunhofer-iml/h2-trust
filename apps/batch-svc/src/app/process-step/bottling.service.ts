import { HttpStatus, Injectable } from '@nestjs/common';
import { BrokerException, ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/api';
import { BatchRepository, BatchTypeDbEnum, DocumentRepository, ProcessStepRepository } from '@h2-trust/database';
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

    const batchIdsForBottle = processStepsForBottle.map((processStep) => processStep.batch.id);
    const bottlingProcessStep = await this.createBottlingProcessStep(processStep, batchIdsForBottle);

    if (remainingHydrogenAmount > 0) {
      await this.createHydrogenProductionProcessStepForRemainingBatchAmount(
        processStep,
        remainingHydrogenAmount,
        processStepsForBottle[0].batch.owner.id,
        processStepsForBottle.at(-1),
      );
    }
    await this.batchRepository.setBatchesInactive(batchIdsForBottle);

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
    batchIdsForBottle: string[],
  ): Promise<ProcessStepEntity> {
    return this.processStepRepository.insertProcessStep(
      {
        ...processStep,
        processType: ProcessType.BOTTLING,
        batch: {
          amount: processStep.batch.amount,
          quality: '{}',
          type: BatchTypeDbEnum.HYDROGEN,
          owner: {
            id: processStep.batch.owner.id,
          },
        },
      },
      batchIdsForBottle,
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
          quality: '{}',
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
}
