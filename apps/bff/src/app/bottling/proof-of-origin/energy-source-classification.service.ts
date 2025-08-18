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
    productionProcessSteps: ProcessStepEntity[],
  ): Promise<ClassificationDto[]> {
    const processStepsWithUnits = await this.fetchProcessStepsWithUnits(productionProcessSteps);
    const energySources = await this.fetchEnergySourceTypes();
    return this.buildEnergySourceClassifications(energySources, processStepsWithUnits);
  }

  private async fetchProcessStepsWithUnits(
    productionProcessSteps: ProcessStepEntity[],
  ): Promise<[ProcessStepEntity, PowerProductionUnitEntity][]> {
    const predecessorSteps = await this.fetchPredecessorProcessSteps(productionProcessSteps);
    if (
      predecessorSteps.length === 0 ||
      !predecessorSteps.every((step) => step.processType === ProcessType.POWER_PRODUCTION)
    ) {
      throw new HttpException(
        `Predecessor process steps must not be empty and must be of type ${ProcessType.POWER_PRODUCTION}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return Promise.all(
      predecessorSteps.map(async (step) => [step, await this.fetchPowerProductionUnit(step.executedBy.id)]),
    );
  }

  private async fetchPredecessorProcessSteps(
    productionProcessSteps: ProcessStepEntity[],
  ): Promise<ProcessStepEntity[]> {
    const predecessorBatches = productionProcessSteps.flatMap((step) => step.batch.predecessors);
    return this.processStepService.fetchProcessStepsForBatches(predecessorBatches);
  }

  private async fetchPowerProductionUnit(id: string): Promise<PowerProductionUnitEntity> {
    return firstValueFrom(this.generalService.send(UnitMessagePatterns.READ, { id }));
  }

  private async fetchEnergySourceTypes(): Promise<string[]> {
    const powerProductionUnitTypes: PowerProductionUnitTypeEntity[] = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNIT_TYPES, {}),
    );
    return Array.from(new Set(powerProductionUnitTypes.map(({ energySource }) => energySource)));
  }

  private buildEnergySourceClassifications(
    energySources: string[],
    processStepsWithUnits: [ProcessStepEntity, PowerProductionUnitEntity][],
  ): ClassificationDto[] {
    const classificationDtos: ClassificationDto[] = [];
    for (const energySource of energySources) {
      const processStepsForAnEnergySourceType = this.filterProcessStepsByEnergySource(
        processStepsWithUnits,
        energySource,
      );
      if (processStepsForAnEnergySourceType.length === 0) continue;
      const batchDtosForAnEnergySourceType = processStepsForAnEnergySourceType.map((step) =>
        ProofOfOriginDtoAssembler.assembleProductionPowerBatchDto(step, energySource),
      );
      const classification = ProofOfOriginDtoAssembler.assemblePowerClassification(
        energySource,
        batchDtosForAnEnergySourceType,
      );
      classificationDtos.push(classification);
    }
    return classificationDtos;
  }

  private filterProcessStepsByEnergySource(
    processStepsWithUnits: [ProcessStepEntity, PowerProductionUnitEntity][],
    energySource: string,
  ): ProcessStepEntity[] {
    return processStepsWithUnits.filter(([, unit]) => unit.type.energySource === energySource).map(([step]) => step);
  }
}
