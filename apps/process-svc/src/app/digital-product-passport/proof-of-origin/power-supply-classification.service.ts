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
  ProofOfOriginBatchEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginPowerBatchEntity,
  ProofOfOriginSubClassificationEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
  ReadByIdPayload,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { BatchType, MeasurementUnit } from '@h2-trust/domain';
import { BatchAssembler } from './batch.assembler';
import { ClassificationAssembler } from './classification.assembler';
import { EmissionAssembler } from './emission.assembler';
import { EmissionService } from './emission.service';

@Injectable()
export class PowerSupplyClassificationService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly emissionService: EmissionService,
  ) { }

  async buildPowerSupplySubClassifications(
    powerProductions: ProcessStepEntity[],
    bottledKgHydrogen: number,
  ): Promise<ProofOfOriginSubClassificationEntity[]> {
    if (!powerProductions?.length) {
      return [];
    }

    const energySources = await this.fetchEnergySources();

    const powerProductionsWithUnits =
      await this.fetchPowerProductionProcessStepsWithPowerProductionUnits(powerProductions);

    const subClassifications: ProofOfOriginSubClassificationEntity[] = [];

    for (const energySource of energySources) {
      const powerProductionsWithUnitsByEnergySource = powerProductionsWithUnits.filter(
        ([, unit]) => unit.type?.energySource === energySource,
      );

      if (powerProductionsWithUnitsByEnergySource.length > 0) {
        const productionPowerBatches: ProofOfOriginBatchEntity[] = await Promise.all(
          powerProductionsWithUnitsByEnergySource.map(async ([powerProduction]) => {
            const [powerSupplyEmission]: ProofOfSustainabilityEmissionCalculationEntity[] =
              await this.emissionService.computePowerSupplyEmissions([powerProduction], bottledKgHydrogen);

            const emission: ProofOfOriginEmissionEntity = EmissionAssembler.assembleEmissionDto(
              powerSupplyEmission,
              bottledKgHydrogen,
            );

            const batch: ProofOfOriginPowerBatchEntity = BatchAssembler.assemblePowerSupply(
              powerProduction,
              energySource,
              emission,
            );

            return batch;
          }),
        );

        const subClassification: ProofOfOriginSubClassificationEntity =
          ClassificationAssembler.assembleSubClassification(
            energySource,
            MeasurementUnit.POWER,
            BatchType.POWER,
            productionPowerBatches,
          );

        subClassifications.push(subClassification);
      }
    }

    return subClassifications;
  }

  private async fetchEnergySources(): Promise<string[]> {
    const powerProductionTypes: PowerProductionTypeEntity[] = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ_POWER_PRODUCTION_TYPES, {}),
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
          this.generalSvc.send(UnitMessagePatterns.READ, new ReadByIdPayload(powerProduction.executedBy.id)),
        );
        return [powerProduction, powerProductionUnit];
      }),
    );
  }
}
