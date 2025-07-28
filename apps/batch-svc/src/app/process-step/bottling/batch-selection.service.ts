import { HttpStatus, Injectable } from '@nestjs/common';
import { BatchEntity, BrokerException, HydrogenComponentEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { parseColor } from '@h2-trust/api';
import { ProcessStepAssemblerService } from './process-step-assembler.service';
import { BatchSelection } from './batch-selection.interface';

@Injectable()
export class BatchSelectionService {
  constructor(private readonly processStepAssemblerService: ProcessStepAssemblerService) {}

  processBottlingForAllColors(
    allProcessStepsFromStorageUnit: ProcessStepEntity[],
    hydrogenComposition: HydrogenComponentEntity[],
    processStepDataForBottling: ProcessStepEntity,
  ): BatchSelection {
    const aggregatedBatchesForBottle: BatchEntity[] = [];
    const aggregatedProcessStepsForRemainingBatchAmount: ProcessStepEntity[] = [];

    for (const hydrogenComponent of hydrogenComposition) {
      const { batchesForBottle, processStepsForRemainingBatchAmount } = this.processBottlingForEachColor(
        allProcessStepsFromStorageUnit,
        hydrogenComponent.color,
        hydrogenComponent.amount,
        processStepDataForBottling,
      );

      aggregatedBatchesForBottle.push(...batchesForBottle);
      aggregatedProcessStepsForRemainingBatchAmount.push(...processStepsForRemainingBatchAmount);
    }

    return {
      batchesForBottle: aggregatedBatchesForBottle,
      processStepsForRemainingBatchAmount: aggregatedProcessStepsForRemainingBatchAmount,
    };
  }

  private processBottlingForEachColor(
    allProcessStepsFromStorageUnit: ProcessStepEntity[],
    color: string,
    amount: number,
    processStepDataForBottling: ProcessStepEntity,
  ): BatchSelection {
    const processStepsFromHydrogenStorageWithRequestedColor = this.filterProcessStepsByColor(
      allProcessStepsFromStorageUnit,
      color,
    );

    const { selectedProcessSteps, remainingHydrogenAmount } =
      this.selectProcessStepsForBottlingAndCalculateRemainingHydrogenAmount(
        processStepsFromHydrogenStorageWithRequestedColor,
        amount,
        processStepDataForBottling.executedBy.id,
        color,
      );

    const processStepForRemainingBatchAmount: ProcessStepEntity[] =
      remainingHydrogenAmount > 0
        ? [
            this.processStepAssemblerService.assembleHydrogenProductionProcessStepForRemainingBatchAmount(
              processStepDataForBottling,
              remainingHydrogenAmount,
              selectedProcessSteps[0].batch.owner.id,
              selectedProcessSteps.at(-1),
            ),
          ]
        : [];

    return {
      batchesForBottle: selectedProcessSteps.map((processStep) => processStep.batch),
      processStepsForRemainingBatchAmount: processStepForRemainingBatchAmount,
    };
  }

  private filterProcessStepsByColor(processSteps: ProcessStepEntity[], color: string): ProcessStepEntity[] {
    return processSteps.filter((processStep) => parseColor(processStep.batch.quality) === color);
  }

  private selectProcessStepsForBottlingAndCalculateRemainingHydrogenAmount(
    availableProcessSteps: ProcessStepEntity[],
    requestedHydrogenAmount: number,
    storageUnitId: string,
    color: string,
  ): { selectedProcessSteps: ProcessStepEntity[]; remainingHydrogenAmount: number } {
    const selectedProcessSteps: ProcessStepEntity[] = [];
    let pendingHydrogenAmount = requestedHydrogenAmount;

    for (const currentProcessStep of availableProcessSteps) {
      selectedProcessSteps.push(currentProcessStep);

      if (currentProcessStep.batch.amount >= pendingHydrogenAmount) {
        const remainingHydrogenAmount = currentProcessStep.batch.amount - pendingHydrogenAmount;
        return {
          selectedProcessSteps,
          remainingHydrogenAmount,
        };
      }

      pendingHydrogenAmount -= currentProcessStep.batch.amount;
    }

    const message = `There is not enough hydrogen in storage unit ${storageUnitId} for the requested amount of ${requestedHydrogenAmount} of quality ${color}.`;
    throw new BrokerException(message, HttpStatus.BAD_REQUEST);
  }
}
