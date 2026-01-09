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
  ReadByIdPayload,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { BatchDto, ClassificationDto, EmissionCalculationDto, EmissionDto, PowerBatchDto } from '@h2-trust/api';
import { EmissionComputationService } from '../emission-computation.service';
import { EmissionCalculationAssembler } from '../emission.assembler';
import { BatchAssembler } from './batch.assembler';
import { ClassificationAssembler } from './classification.assembler';

@Injectable()
export class PowerSupplyClassificationService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly emissionComputationService: EmissionComputationService,
  ) {}

  async buildPowerSupplyClassifications(
    powerProductions: ProcessStepEntity[],
    hydrogenAmount: number,
  ): Promise<ClassificationDto[]> {
    if (!powerProductions?.length) {
      return [];
    }

    const energySources = await this.fetchEnergySources();
    const powerProductionsWithUnits =
      await this.fetchPowerProductionProcessStepsWithPowerProductionUnits(powerProductions);
    const classifications: ClassificationDto[] = [];

    for (const energySource of energySources) {
      const powerProductionsWithUnitsByEnergySource = powerProductionsWithUnits.filter(
        ([, unit]) => unit.type?.energySource === energySource,
      );

      if (powerProductionsWithUnitsByEnergySource.length > 0) {
        const productionPowerBatches: BatchDto[] = await Promise.all(
          powerProductionsWithUnitsByEnergySource.map(async ([powerProduction]) => {
            const [powerSupplyEmission]: EmissionCalculationDto[] =
              await this.emissionComputationService.computePowerSupplyEmissions([powerProduction], hydrogenAmount);

            const emission: EmissionDto = EmissionCalculationAssembler.assembleEmissionDto(
              powerSupplyEmission,
              hydrogenAmount,
            );

            const batch: PowerBatchDto = BatchAssembler.assemblePowerSupplyBatchDto(
              powerProduction,
              energySource,
              emission,
            );

            return batch;
          }),
        );

        const classification: ClassificationDto = ClassificationAssembler.assemblePowerClassification(
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
    powerProductions: ProcessStepEntity[],
  ): Promise<[ProcessStepEntity, PowerProductionUnitEntity][]> {
    // TODO-MP: bulk request to fetch all units at once (see computePowerSupplyEmissions)
    return Promise.all(
      powerProductions.map(async (powerProduction): Promise<[ProcessStepEntity, PowerProductionUnitEntity]> => {
        const powerProductionUnit: PowerProductionUnitEntity = await firstValueFrom(
          this.generalService.send(UnitMessagePatterns.READ, new ReadByIdPayload(powerProduction.executedBy.id)),
        );
        return [powerProduction, powerProductionUnit];
      }),
    );
  }
}
