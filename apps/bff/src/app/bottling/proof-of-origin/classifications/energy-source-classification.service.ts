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
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { BatchDto, ClassificationDto, EmissionCalculationDto } from '@h2-trust/api';
import { assembleEmissionDto } from '../assembler/emission.assembler';
import { EmissionCalculatorService } from '../../emission/emission-calculator.service';
import { BatchAssembler } from '../assembler/batch.assembler';
import { ClassificationAssembler } from '../assembler/classification.assembler';

@Injectable()
export class EnergySourceClassificationService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly emissionCalculatorService: EmissionCalculatorService,
  ) { }

  async buildEnergySourceClassifications(
    powerProductionProcessSteps: ProcessStepEntity[],
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
          const emissionCalculation: EmissionCalculationDto = await this.emissionCalculatorService.computePowerCalculation(processStep);

          const h2KgEquivalentToPowerBatch = processStep.batch.successors[0].amount;
          const emission = assembleEmissionDto(emissionCalculation, h2KgEquivalentToPowerBatch);

          const productionPowerBatch = BatchAssembler.assemblePowerProductionBatchDto(
            processStep,
            energySource,
            emission,
          );
          productionPowerBatches.push(productionPowerBatch);
        }

        const classification = ClassificationAssembler.assemblePowerClassification(
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
