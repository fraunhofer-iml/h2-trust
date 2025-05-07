import { HttpStatus, Injectable } from '@nestjs/common';
import { BatchEntity, BrokerException, ProcessStepEntity, ProcessTypeName } from '@h2-trust/amqp';
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

    const allBatchesFromStorageUnit = await this.batchRepository.findAllHydrogenBatchesFromStorageUnit(
      processStep.unitId,
    );
    this.ensureBatchesExist(allBatchesFromStorageUnit, processStep.unitId);

    const { batchesForBottle, remainingHydrogenAmount } = this.pickBatchesForBottleAndCalculateRemainingBatchAmount(
      allBatchesFromStorageUnit,
      processStep.batch.amount,
      processStep.unitId,
    );

    const batchIdsForBottle = batchesForBottle.map((batch) => batch.id);
    const bottlingProcessStep = await this.createBottlingProcessStep(processStep, batchIdsForBottle);

    if (remainingHydrogenAmount > 0) {
      await this.createHydrogenProductionProcessStepForRemainingBatchAmount(
        processStep,
        remainingHydrogenAmount,
        batchesForBottle[0].owner.id,
        [batchIdsForBottle.at(-1)],
      );
    }
    await this.batchRepository.setBatchesInactive(batchIdsForBottle);

    if (file) {
      await this.addDocumentToProcessStep(file, bottlingProcessStep.id, processStep.documents[0]?.description);
    }

    return this.processStepRepository.findProcessStep(bottlingProcessStep.id);
  }

  private validateProcessStep(processStep: ProcessStepEntity): void {
    if (!processStep.unitId) {
      throw new BrokerException(`No storage unit for hydrogen extraction specified`, HttpStatus.BAD_REQUEST);
    }

    if (!processStep.batch || isNaN(Number(processStep.batch.amount)) || Number(processStep.batch.amount) <= 0) {
      throw new BrokerException(
        `No valid hydrogen amount specified: (${processStep.batch?.amount})`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private ensureBatchesExist(allBatchesFromStorageUnit: BatchEntity[], storageUnitId: string): void {
    if (allBatchesFromStorageUnit.length === 0) {
      throw new BrokerException(`No batches found in storage unit ${storageUnitId}`, HttpStatus.BAD_REQUEST);
    }
  }

  private pickBatchesForBottleAndCalculateRemainingBatchAmount(
    allBatchesFromStorageUnit: BatchEntity[],
    bottleCapacity: number,
    storageUnitId: string,
  ) {
    const batchesForBottle: BatchEntity[] = [];
    let requiredHydrogenAmount = bottleCapacity;
    let remainingHydrogenAmount: number;

    for (const batchFromStorageUnit of allBatchesFromStorageUnit) {
      batchesForBottle.push(batchFromStorageUnit);

      if (batchFromStorageUnit.amount >= requiredHydrogenAmount) {
        remainingHydrogenAmount = batchFromStorageUnit.amount - requiredHydrogenAmount;
        requiredHydrogenAmount = 0;
        break;
      }

      requiredHydrogenAmount -= batchFromStorageUnit.amount;
    }

    if (requiredHydrogenAmount !== 0) {
      const message = `There is not enough hydrogen in storage unit ${storageUnitId} for the requested amount of ${bottleCapacity}`;
      throw new BrokerException(message, HttpStatus.BAD_REQUEST);
    }

    return { batchesForBottle, remainingHydrogenAmount };
  }

  private async createBottlingProcessStep(
    processStep: ProcessStepEntity,
    batchIdsForBottle: string[],
  ): Promise<ProcessStepEntity> {
    return this.processStepRepository.insertProcessStep(
      {
        startedAt: processStep.startedAt,
        endedAt: processStep.endedAt,
        processTypeName: ProcessTypeName.BOTTLING,
        batch: {
          amount: processStep.batch.amount,
          quality: '{}',
          type: BatchTypeDbEnum.HYDROGEN,
          owner: {
            id: processStep.batch.owner.id,
            name: undefined,
            mastrNumber: undefined,
            companyType: undefined,
          },
        },
        userId: processStep.userId,
        unitId: processStep.unitId,
      },
      batchIdsForBottle,
    );
  }

  private async createHydrogenProductionProcessStepForRemainingBatchAmount(
    processStep: ProcessStepEntity,
    remainingAmount: number,
    ownerId: string,
    batchIdsForBottle: string[],
  ): Promise<ProcessStepEntity> {
    return this.processStepRepository.insertProcessStep(
      {
        startedAt: processStep.startedAt,
        endedAt: processStep.endedAt,
        processTypeName: ProcessTypeName.HYDROGEN_PRODUCTION,
        batch: {
          amount: remainingAmount,
          quality: '{}',
          type: BatchTypeDbEnum.HYDROGEN,
          owner: {
            id: ownerId,
            name: undefined,
            mastrNumber: undefined,
            companyType: undefined,
          },
          hydrogenStorageUnitId: processStep.unitId,
        },
        userId: processStep.userId,
        unitId: processStep.unitId,
      },
      batchIdsForBottle,
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
