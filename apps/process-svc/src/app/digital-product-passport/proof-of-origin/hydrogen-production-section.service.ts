/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProofOfOriginBatchEntity,
  ProofOfOriginClassificationEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginPowerBatchEntity,
  ProofOfOriginSectionEntity,
  ProofOfOriginSubClassificationEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
} from '@h2-trust/amqp';
import { BatchType, EnergySource, PowerType, ProofOfOrigin } from '@h2-trust/domain';
import { EmissionService } from './emission.service';
import { WaterSupplyClassificationAssembler } from './water-supply-classification.assembler';

@Injectable()
export class HydrogenProductionSectionService {
  constructor(private readonly emissionService: EmissionService) {}

  buildSection(
    powerProductions: ProcessStepEntity[],
    waterConsumptions: ProcessStepEntity[],
    bottledKgHydrogen: number,
  ): ProofOfOriginSectionEntity {
    const classifications: ProofOfOriginClassificationEntity[] = [];

    if (powerProductions?.length) {
      const energySourceSubClassifications: ProofOfOriginSubClassificationEntity[] =
        this.buildPowerSupplySubClassifications(powerProductions, bottledKgHydrogen);

      const powerSupplyClassification: ProofOfOriginClassificationEntity = ProofOfOriginClassificationEntity.assemble(
        ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION,
        BatchType.POWER,
        [],
        energySourceSubClassifications,
      );

      classifications.push(powerSupplyClassification);
    }

    if (waterConsumptions?.length) {
      const waterSupplyClassification: ProofOfOriginClassificationEntity =
        WaterSupplyClassificationAssembler.assembleClassification(waterConsumptions, bottledKgHydrogen);

      classifications.push(waterSupplyClassification);
    }

    return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION, [], classifications);
  }

  buildPowerSupplySubClassifications(
    powerProductions: ProcessStepEntity[],
    bottledKgHydrogen: number,
  ): ProofOfOriginSubClassificationEntity[] {
    if (!powerProductions?.length) {
      return [];
    }

    const occuringEnergySources = [
      ...new Set(
        powerProductions.map(
          (powerProduction) => (powerProduction.executedBy as PowerProductionUnitEntity).type?.energySource,
        ),
      ),
    ];

    const subClassifications: ProofOfOriginSubClassificationEntity[] = [];

    for (const energySource of occuringEnergySources) {
      const powerProductionsByEnergySource: ProcessStepEntity[] = powerProductions.filter(
        (powerProduction) =>
          (powerProduction.executedBy as PowerProductionUnitEntity).type?.energySource === energySource,
      );

      if (powerProductionsByEnergySource.length > 0) {
        const productionPowerBatches: ProofOfOriginBatchEntity[] = powerProductionsByEnergySource.map(
          (powerProduction) => {
            const [powerSupplyEmission]: ProofOfSustainabilityEmissionCalculationEntity[] =
              this.emissionService.computePowerSupplyEmissions([powerProduction]);

            const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
              bottledKgHydrogen,
              powerSupplyEmission.result,
            );

            const batch: ProofOfOriginPowerBatchEntity = this.assemblePowerSupply(
              powerProduction,
              energySource,
              emission,
            );

            return batch;
          },
        );

        const subClassification: ProofOfOriginSubClassificationEntity = ProofOfOriginSubClassificationEntity.assemble(
          energySource,
          BatchType.POWER,
          productionPowerBatches,
        );

        subClassifications.push(subClassification);
      }
    }
    return subClassifications;
  }

  private assemblePowerSupply(
    powerProduction: ProcessStepEntity,
    energySource: string,
    emission?: ProofOfOriginEmissionEntity,
  ): ProofOfOriginPowerBatchEntity {
    return {
      id: powerProduction.batch.id,
      emission,
      createdAt: powerProduction.startedAt,
      amount: powerProduction.batch.amount,
      batchType: BatchType.POWER,
      producer: powerProduction.batch.owner.name,
      unitId: powerProduction.executedBy.id,
      energySource: energySource as EnergySource,
      accountingPeriodEnd: powerProduction.endedAt,
      powerType: (powerProduction.batch?.qualityDetails?.powerType ?? PowerType.NOT_SPECIFIED) as PowerType,
    };
  }
}
