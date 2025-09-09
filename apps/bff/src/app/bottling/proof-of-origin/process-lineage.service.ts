import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BatchEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/api';
import { ProcessStepService } from './process-step.service';
import { assertNumberOfProcessSteps, assertPredecessorsExist, assertProcessType } from './proof-of-origin.validation';

@Injectable()
export class ProcessLineageService {
  constructor(private readonly processStepService: ProcessStepService) {}

  async fetchPowerProductionProcessSteps(processSteps: ProcessStepEntity[]): Promise<ProcessStepEntity[]> {
    if (!processSteps || processSteps.length === 0) {
      throw new HttpException(
        `Process steps of type [${ProcessType.HYDROGEN_PRODUCTION}] are missing.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    assertProcessType(processSteps, ProcessType.HYDROGEN_PRODUCTION);

    // Start with the first layer HYDROGEN_BOTTLING -> due to split batches we may have multiple layers of HYDROGEN_PRODUCTION predecessors
    let currentProcessStepLayer: ProcessStepEntity[] = processSteps;

    // Collect all POWER_PRODUCTION process steps across all layers
    const powerProductionProcessStepsById = new Map<string, ProcessStepEntity>();

    while (currentProcessStepLayer.length > 0) {
      const powerProductionProcessSteps = currentProcessStepLayer.filter(
        (processSteps) => processSteps.processType === ProcessType.POWER_PRODUCTION,
      );

      // Collect POWER_PRODUCTION process steps of the current layer
      for (const powerProductionProcessStep of powerProductionProcessSteps) {
        powerProductionProcessStepsById.set(powerProductionProcessStep.id, powerProductionProcessStep);
      }

      const otherProcessSteps = currentProcessStepLayer.filter(
        (processStep) => processStep.processType !== ProcessType.POWER_PRODUCTION,
      );

      // If there are no non-POWER_PRODUCTION process steps left in the current layer, we are done
      if (otherProcessSteps.length === 0) {
        break;
      }

      const predecessorBatches = otherProcessSteps.flatMap((processStep) =>
        this.getPredecessorBatchesOrThrow(processStep),
      );
      currentProcessStepLayer = await this.processStepService.fetchProcessStepsOfBatches(predecessorBatches);
    }

    return Array.from(powerProductionProcessStepsById.values());
  }

  async fetchHydrogenProductionProcessSteps(processStep: ProcessStepEntity): Promise<ProcessStepEntity[]> {
    if (!processStep) {
      throw new HttpException(
        `Process step of type [${ProcessType.HYDROGEN_BOTTLING}] is missing.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    assertProcessType([processStep], ProcessType.HYDROGEN_BOTTLING);

    const predecessorBatches: BatchEntity[] = this.getPredecessorBatchesOrThrow(processStep);
    const processStepsOfPredecessorBatches =
      await this.processStepService.fetchProcessStepsOfBatches(predecessorBatches);
    assertProcessType(processStepsOfPredecessorBatches, ProcessType.HYDROGEN_PRODUCTION);
    assertNumberOfProcessSteps(processStepsOfPredecessorBatches, predecessorBatches.length);

    return processStepsOfPredecessorBatches;
  }

  async fetchHydrogenBottlingProcessStep(processStep: ProcessStepEntity): Promise<ProcessStepEntity> {
    if (!processStep) {
      throw new HttpException(
        `Process step of type [${ProcessType.HYDROGEN_TRANSPORTATION}] is missing.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    assertProcessType([processStep], ProcessType.HYDROGEN_TRANSPORTATION);

    const predecessorBatches: BatchEntity[] = this.getPredecessorBatchesOrThrow(processStep);
    const processStepsOfPredecessorBatches: ProcessStepEntity[] =
      await this.processStepService.fetchProcessStepsOfBatches(predecessorBatches);
    assertProcessType(processStepsOfPredecessorBatches, ProcessType.HYDROGEN_BOTTLING);
    assertNumberOfProcessSteps(processStepsOfPredecessorBatches, 1);

    return processStepsOfPredecessorBatches[0];
  }

  private getPredecessorBatchesOrThrow(processStep: ProcessStepEntity): BatchEntity[] {
    const predecessorBatches: BatchEntity[] = processStep.batch?.predecessors;
    assertPredecessorsExist(predecessorBatches, processStep.id);
    return predecessorBatches;
  }
}
