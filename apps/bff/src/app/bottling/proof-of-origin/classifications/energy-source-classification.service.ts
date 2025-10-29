/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerQueues,
  PowerProductionTypeEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  SustainabilityMessagePatterns,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { BatchDto, ClassificationDto, EmissionCalculationDto } from '@h2-trust/api';
import { toEmissionDto } from '../emission-dto.builder';
import { ProofOfOriginDtoAssembler } from '../proof-of-origin-dto.assembler';

@Injectable()
export class EnergySourceClassificationService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processClient: ClientProxy,
  ) {}

  async buildEnergySourceClassificationsFromContext(
    powerProductionProcessSteps: ProcessStepEntity[],
    batchAmount: number,
  ): Promise<ClassificationDto[]> {
    if (powerProductionProcessSteps.length === 0) {
      return [];
    }

    const energySources = await this.fetchEnergySources();
    const processStepsWithUnits =
      await this.fetchPowerProductionProcessStepsWithPowerProductionUnits(powerProductionProcessSteps);
    const classifications: ClassificationDto[] = [];

    for (const energySource of energySources) {
      const processStepsWithUnitsByEnergySource = processStepsWithUnits.filter(
        ([, unit]) => unit.type?.energySource === energySource,
      );

      if (processStepsWithUnitsByEnergySource.length > 0) {
        const productionPowerBatches: BatchDto[] = [];

        for (const [processStep] of processStepsWithUnitsByEnergySource) {
          const emissionCalculation: EmissionCalculationDto = await firstValueFrom(
            this.processClient.send(SustainabilityMessagePatterns.COMPUTE_POWER_FOR_STEP, { processStep: processStep }),
          );
          const emission = toEmissionDto(emissionCalculation, batchAmount);

          const productionPowerBatch = ProofOfOriginDtoAssembler.assembleProductionPowerBatchDto(
            processStep,
            energySource,
            emission,
          );
          productionPowerBatches.push(productionPowerBatch);
        }

        const classification = ProofOfOriginDtoAssembler.assemblePowerClassification(
          energySource,
          productionPowerBatches,
        );
        classifications.push(classification);
      }
    }

    return classifications;
  }

  private async fetchEnergySources(): Promise<string[]> {
    const powerProductionTypes: PowerProductionTypeEntity[] = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_POWER_PRODUCTION_TYPES, {}),
    );
    return Array.from(new Set(powerProductionTypes.map(({ energySource }) => energySource)));
  }

  private async fetchPowerProductionProcessStepsWithPowerProductionUnits(
    processSteps: ProcessStepEntity[],
  ): Promise<[ProcessStepEntity, PowerProductionUnitEntity][]> {
    return Promise.all(
      processSteps.map(async (processStep): Promise<[ProcessStepEntity, PowerProductionUnitEntity]> => {
        const unit: PowerProductionUnitEntity = await firstValueFrom(
          this.generalService.send(UnitMessagePatterns.READ, { id: processStep.executedBy.id }),
        );
        return [processStep, unit];
      }),
    );
  }
}
