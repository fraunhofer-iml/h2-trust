import { firstValueFrom } from 'rxjs';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerQueues,
  PowerProductionUnitEntity,
  PowerProductionUnitTypeEntity,
  ProcessStepEntity,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { ClassificationDto, ProcessType } from '@h2-trust/api';
import { ProcessStepService } from './process-step.service';
import { ProofOfOriginDtoAssembler } from './proof-of-origin-dto.assembler';

@Injectable()
export class EnergySourceClassificationService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly processStepService: ProcessStepService,
  ) {}

  async buildEnergySourceClassificationsFromProcessSteps(
    hydrogenProductionProcessSteps: ProcessStepEntity[],
  ): Promise<ClassificationDto[]> {
    const powerProductionProcessStepsWithPowerProductionUnits =
      await this.fetchPowerProductionProcessStepsWithPowerProductionUnits(hydrogenProductionProcessSteps);
    const energySources = await this.fetchEnergySources();
    return this.buildEnergySourceClassifications(energySources, powerProductionProcessStepsWithPowerProductionUnits);
  }

  private async fetchPowerProductionProcessStepsWithPowerProductionUnits(
    hydrogenProductionProcessSteps: ProcessStepEntity[],
  ): Promise<[ProcessStepEntity, PowerProductionUnitEntity][]> {
    if (!hydrogenProductionProcessSteps?.length) {
      throw new HttpException('Hydrogen production process steps must not be empty.', HttpStatus.BAD_REQUEST);
    }

    // Start with the first layer BOTTLING
    let processStepsOfCurrentLayer: ProcessStepEntity[] = hydrogenProductionProcessSteps;

    // Collect all POWER_PRODUCTION process steps across all layers
    const powerProductionProcessStepsById = new Map<string, ProcessStepEntity>();

    while (processStepsOfCurrentLayer.length > 0) {
      const powerProductionProcessSteps = processStepsOfCurrentLayer.filter(
        (step) => step.processType === ProcessType.POWER_PRODUCTION,
      );

      // Collect POWER_PRODUCTION process steps of current layer
      for (const powerProductionProcessStep of powerProductionProcessSteps) {
        powerProductionProcessStepsById.set(powerProductionProcessStep.id, powerProductionProcessStep);
      }

      const nonPowerProductionProcessSteps = processStepsOfCurrentLayer.filter(
        (step) => step.processType !== ProcessType.POWER_PRODUCTION,
      );

      // If there are no non-POWER_PRODUCTION process steps left in the current layer, we are done
      if (nonPowerProductionProcessSteps.length === 0) {
        break;
      }

      // Move one layer backwards only for non-POWER_PRODUCTION process steps
      const predecessorBatches = nonPowerProductionProcessSteps.flatMap((step) => step.batch?.predecessors ?? []);
      if (!predecessorBatches.length) {
        const processStepIdsWithProcessType = nonPowerProductionProcessSteps
          .map((step) => `${step.id} ${step.processType}`)
          .join(', ');
        const errorMessage = `No further predecessors could be found for the following non-POWER_PRODUCTION process steps: ${processStepIdsWithProcessType}`;
        throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
      }

      const predecessorProcessSteps = await this.processStepService.fetchProcessStepsOfBatches(predecessorBatches);
      if (predecessorProcessSteps.length !== predecessorBatches.length) {
        const errorMessage = `Predecessor process step length [${predecessorProcessSteps.length}] and predecessor batch length [${predecessorBatches.length}] do not match.`;
        throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
      }

      processStepsOfCurrentLayer = predecessorProcessSteps;
    }

    const powerProductionProcessSteps = Array.from(powerProductionProcessStepsById.values());
    return Promise.all(
      powerProductionProcessSteps.map(async (step) => [step, await this.fetchPowerProductionUnit(step.executedBy.id)]),
    );
  }

  private async fetchPowerProductionUnit(id: string): Promise<PowerProductionUnitEntity> {
    return firstValueFrom(this.generalService.send(UnitMessagePatterns.READ, { id }));
  }

  private async fetchEnergySources(): Promise<string[]> {
    const powerProductionUnitTypes: PowerProductionUnitTypeEntity[] = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNIT_TYPES, {}),
    );
    return Array.from(new Set(powerProductionUnitTypes.map(({ energySource }) => energySource)));
  }

  private buildEnergySourceClassifications(
    energySources: string[],
    powerProductionProcessStepsWithPowerProductionUnits: [ProcessStepEntity, PowerProductionUnitEntity][],
  ): ClassificationDto[] {
    const classificationDtos: ClassificationDto[] = [];

    for (const energySource of energySources) {
      const filteredPowerProductionProcessSteps = powerProductionProcessStepsWithPowerProductionUnits
        .filter(([, unit]) => unit.type?.energySource === energySource)
        .map(([step]) => step);

      if (filteredPowerProductionProcessSteps.length > 0) {
        const productionPowerBatchDtos = filteredPowerProductionProcessSteps.map((step) =>
          ProofOfOriginDtoAssembler.assembleProductionPowerBatchDto(step, energySource),
        );

        const classification = ProofOfOriginDtoAssembler.assemblePowerClassification(
          energySource,
          productionPowerBatchDtos,
        );
        classificationDtos.push(classification);
      }
    }
    return classificationDtos;
  }
}
