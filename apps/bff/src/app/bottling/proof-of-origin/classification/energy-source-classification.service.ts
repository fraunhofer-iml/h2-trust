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
import { BatchDto, ClassificationDto } from '@h2-trust/api';
import { ProofOfOriginDtoAssembler } from '../assembler/proof-of-origin-dto.assembler';

@Injectable()
export class EnergySourceClassificationService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  async buildEnergySourceClassificationsFromProcessSteps(
    powerProductionProcessSteps: ProcessStepEntity[],
  ): Promise<ClassificationDto[]> {
    const energySources = await this.fetchEnergySources();
    const powerProductionProcessStepsWithPowerProductionUnits =
      await this.fetchPowerProductionProcessStepsWithPowerProductionUnits(powerProductionProcessSteps);
    return this.buildEnergySourceClassifications(energySources, powerProductionProcessStepsWithPowerProductionUnits);
  }

  private async fetchEnergySources(): Promise<string[]> {
    const powerProductionTypes: PowerProductionTypeEntity[] = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_POWER_PRODUCTION_TYPES, {}),
    );
    return Array.from(new Set(powerProductionTypes.map(({ energySource }) => energySource)));
  }

  private async fetchPowerProductionProcessStepsWithPowerProductionUnits(
    powerProductionProcessSteps: ProcessStepEntity[],
  ): Promise<[ProcessStepEntity, PowerProductionUnitEntity][]> {
    return Promise.all(
      powerProductionProcessSteps.map(
        async (powerProductionProcessStep): Promise<[ProcessStepEntity, PowerProductionUnitEntity]> => {
          const powerProductionUnit: PowerProductionUnitEntity = await firstValueFrom(
            this.generalService.send(UnitMessagePatterns.READ, { id: powerProductionProcessStep.executedBy.id }),
          );
          return [powerProductionProcessStep, powerProductionUnit];
        },
      ),
    );
  }

  private buildEnergySourceClassifications(
    energySources: string[],
    powerProductionProcessStepsWithPowerProductionUnits: [ProcessStepEntity, PowerProductionUnitEntity][],
  ): ClassificationDto[] {
    const classificationDtos: ClassificationDto[] = [];

    for (const energySource of energySources) {
      const filteredPowerProductionProcessSteps = powerProductionProcessStepsWithPowerProductionUnits
        .filter(([, powerProductionUnit]) => powerProductionUnit.type?.energySource === energySource)
        .map(([processStep]) => processStep);

      if (filteredPowerProductionProcessSteps.length > 0) {
        const productionPowerBatchDtos: BatchDto[] = filteredPowerProductionProcessSteps.map((processStep) =>
          ProofOfOriginDtoAssembler.assembleProductionPowerBatchDto(processStep, energySource),
        );

        const powerClassification: ClassificationDto = ProofOfOriginDtoAssembler.assemblePowerClassification(
          energySource,
          productionPowerBatchDtos,
        );
        classificationDtos.push(powerClassification);
      }
    }
    return classificationDtos;
  }
}
