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
  ProofOfOriginWaterBatchEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
} from '@h2-trust/amqp';
import { BatchType, EnergySource, PowerType, ProofOfOrigin } from '@h2-trust/domain';
import { WaterConsumptionEmissionService } from './emission-services/water-consumption-emission.service';
import { PowerProductionEmissionService } from './power-production-emission.service';

@Injectable()
export class HydrogenProductionSectionService {
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
      const waterSupplyClassification: ProofOfOriginClassificationEntity = this.assembleWaterSupplyClassification(
        waterConsumptions,
        bottledKgHydrogen,
      );

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
              this.computePowerSupplyEmissions([powerProduction]);

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

  computePowerSupplyEmissions(powerProductions: ProcessStepEntity[]): ProofOfSustainabilityEmissionCalculationEntity[] {
    if (!powerProductions.length) {
      return [];
    }

    return powerProductions.map((powerProduction) => {
      if (!powerProduction.executedBy) {
        throw new Error(`PowerProductionUnit for process step ${powerProduction} not found.`);
      }
      const unit = powerProduction.executedBy as PowerProductionUnitEntity;
      return PowerProductionEmissionService.assemblePowerSupply(powerProduction, unit.type.energySource);
    });
  }

  private assembleWaterSupplyClassification(
    waterSupplies: ProcessStepEntity[],
    bottledKgHydrogen: number,
  ): ProofOfOriginClassificationEntity {
    if (!waterSupplies?.length) {
      const message = 'No process steps of type water supply found.';
      throw new Error(message);
    }

    const waterBatches: ProofOfOriginWaterBatchEntity[] = waterSupplies.map((waterSupply) => {
      const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
        WaterConsumptionEmissionService.assembleWaterSupply(waterSupply);

      const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
        bottledKgHydrogen,
        emissionCalculation.result,
      );

      const batch: ProofOfOriginWaterBatchEntity = this.assembleWaterSupply(waterSupply, emission);

      return batch;
    });

    return ProofOfOriginClassificationEntity.assemble(
      ProofOfOrigin.WATER_SUPPLY_CLASSIFICATION,
      BatchType.WATER,
      waterBatches,
      [],
    );
  }

  private assembleWaterSupply(
    waterConsumption: ProcessStepEntity,
    emission?: ProofOfOriginEmissionEntity,
  ): ProofOfOriginWaterBatchEntity {
    return {
      id: waterConsumption.batch.id,
      emission,
      createdAt: waterConsumption.startedAt,
      amount: waterConsumption.batch.amount,
      batchType: BatchType.WATER,
      deionizedWaterAmount: waterConsumption.batch.amount,
      deionizedWaterEmission: { totalEmissions: 0, totalEmissionsPerKgHydrogen: 0, basisOfCalculation: [] },
    };
  }
}
