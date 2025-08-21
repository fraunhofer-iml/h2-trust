import { HttpStatus, Injectable } from '@nestjs/common';
import { BatchEntity, BrokerException, HydrogenComponentEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { parseColor } from '@h2-trust/api';
import { ProcessStepAssemblerService } from './process-step-assembler.service';
import { BatchSelection } from './batch-selection.interface';

@Injectable()
export class BatchSelectionService {
  constructor(private readonly processStepAssemblerService: ProcessStepAssemblerService) { }

  processBottlingForAllColors(
    allProcessStepsFromStorageUnit: ProcessStepEntity[],
    hydrogenComposition: HydrogenComponentEntity[],
    processStepDataForBottling: ProcessStepEntity,
  ): BatchSelection {
    const aggregatedBatchesForBottle: BatchEntity[] = [];
    const aggregatedProcessStepsForRemainingAmount: ProcessStepEntity[] = [];

    for (const hydrogenComponent of hydrogenComposition) {
      const { batchesForBottle, processStepsForRemainingAmount } = this.processBottlingForEachColor(
        allProcessStepsFromStorageUnit,
        hydrogenComponent.color,
        hydrogenComponent.amount,
        processStepDataForBottling,
      );

      aggregatedBatchesForBottle.push(...batchesForBottle);
      aggregatedProcessStepsForRemainingAmount.push(...processStepsForRemainingAmount);
    }

    return {
      batchesForBottle: aggregatedBatchesForBottle,
      processStepsForRemainingAmount: aggregatedProcessStepsForRemainingAmount,
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

    const { selectedProcessSteps, remainingAmount } =
      this.selectProcessStepsForBottlingAndCalculateRemainingAmount(
        processStepsFromHydrogenStorageWithRequestedColor,
        amount,
        processStepDataForBottling.executedBy.id,
        color,
      );

    const processStepsForRemainingAmount: ProcessStepEntity[] =
      remainingAmount > 0
        ? [
          this.processStepAssemblerService.assembleHydrogenProductionProcessStepForRemainingAmount(
            processStepDataForBottling,
            remainingAmount,
            selectedProcessSteps[0].batch.owner.id,
            selectedProcessSteps.at(-1),
          ),
        ]
        : [];

    return {
      batchesForBottle: selectedProcessSteps.map((processStep) => processStep.batch),
      processStepsForRemainingAmount,
    };
  }

  private filterProcessStepsByColor(processSteps: ProcessStepEntity[], color: string): ProcessStepEntity[] {
    return processSteps.filter((processStep) => parseColor(processStep.batch.quality) === color);
  }

  private selectProcessStepsForBottlingAndCalculateRemainingAmount(
    availableProcessSteps: ProcessStepEntity[],
    requestedAmount: number,
    storageUnitId: string,
    color: string,
  ): { selectedProcessSteps: ProcessStepEntity[]; remainingAmount: number } {
    const selectedProcessSteps: ProcessStepEntity[] = [];
    let pendingAmount = requestedAmount;

    for (const currentProcessStep of availableProcessSteps) {
      selectedProcessSteps.push(currentProcessStep);

      if (currentProcessStep.batch.amount >= pendingAmount) {
        const remainingAmount = currentProcessStep.batch.amount - pendingAmount;
        return { selectedProcessSteps, remainingAmount };
      }

      pendingAmount -= currentProcessStep.batch.amount;
    }

    const message = `There is not enough hydrogen in storage unit ${storageUnitId} for the requested amount of ${requestedAmount} of quality ${color}.`;
    throw new BrokerException(message, HttpStatus.BAD_REQUEST);
  }
}
