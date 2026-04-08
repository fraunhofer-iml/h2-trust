/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProofOfOriginBatchEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginPowerBatchEntity,
  ProofOfOriginSubClassificationEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
} from '@h2-trust/amqp';
import { BatchType, EnergySource, PowerType } from '@h2-trust/domain';
import { PowerProductionPosService } from '../proof-of-sustainability/power-production-pos.service';
import { Util } from '../util';

export class PowerProductionProofOfOriginService {
  private powerProductionPosService: PowerProductionPosService = new PowerProductionPosService();
  public buildPowerSupplySubClassifications(
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
        const productionPowerBatches: ProofOfOriginBatchEntity[] = this.getPowerBatchEntities(
          powerProductionsByEnergySource,
          bottledKgHydrogen,
          energySource,
        );

        const subClassification: ProofOfOriginSubClassificationEntity = Util.assembleSubClassification(
          energySource,
          BatchType.POWER,
          productionPowerBatches,
        );

        subClassifications.push(subClassification);
      }
    }
    return subClassifications;
  }

  getPowerBatchEntities(
    powerProductionProcesses: ProcessStepEntity[],
    bottledKgHydrogen: number,
    energySource: EnergySource,
  ): ProofOfOriginPowerBatchEntity[] {
    return powerProductionProcesses.map((powerProduction) => {
      const [powerSupplyEmission]: ProofOfSustainabilityEmissionCalculationEntity[] =
        this.powerProductionPosService.computePowerSupplyEmissions([powerProduction]);

      const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
        bottledKgHydrogen,
        powerSupplyEmission.result,
        powerSupplyEmission.basisOfCalculation,
      );

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
    });
  }
}
