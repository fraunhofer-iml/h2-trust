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
import { BatchType, EnergySource, PowerType, ProcessType } from '@h2-trust/domain';
import { computePowerSupplyEmissionCalculations } from '../proof-of-sustainability/power-production-proof-of-sustainability.assembler';
import { Util } from '../util';

function getPowerBatchEntities(
  powerProductionProcesses: ProcessStepEntity[],
  bottledKgHydrogen: number,
  energySource: EnergySource,
): ProofOfOriginPowerBatchEntity[] {
  return powerProductionProcesses.map((powerProduction) => {
    const [powerSupplyEmission]: ProofOfSustainabilityEmissionCalculationEntity[] =
      computePowerSupplyEmissionCalculations([powerProduction]);

    const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
      bottledKgHydrogen,
      powerSupplyEmission.result,
      powerSupplyEmission.basisOfCalculation,
    );
    const powerType: PowerType = powerProduction.batch?.qualityDetails?.powerType ?? PowerType.NOT_SPECIFIED;

    return {
      id: powerProduction.batch.id,
      emission,
      createdAt: powerProduction.startedAt,
      amount: powerProduction.batch.amount,
      batchType: BatchType.POWER,
      producer: powerProduction.batch.owner.name,
      unitId: powerProduction.executedBy.id,
      energySource: energySource,
      accountingPeriodEnd: powerProduction.endedAt,
      powerType: powerType,
    };
  });
}

function getEnergySource(powerProduction: ProcessStepEntity): EnergySource {
  const unit = powerProduction.executedBy as PowerProductionUnitEntity;
  return unit.type?.energySource;
}

function onlyPowerProduction(processSteps: ProcessStepEntity[]) {
  return !processSteps.some((processStep) => processStep.type != ProcessType.POWER_PRODUCTION);
}

export function buildPowerSupplySubClassifications(
  powerProductions: ProcessStepEntity[],
  bottledKgHydrogen: number,
): ProofOfOriginSubClassificationEntity[] {
  if (!powerProductions?.length || bottledKgHydrogen === 0 || !onlyPowerProduction(powerProductions)) {
    return [];
  }

  const occurringEnergySources = [...new Set(powerProductions.map(getEnergySource))];

  const subClassifications: ProofOfOriginSubClassificationEntity[] = [];

  for (const energySource of occurringEnergySources) {
    const powerProductionsByEnergySource: ProcessStepEntity[] = powerProductions.filter(
      (powerProduction) => getEnergySource(powerProduction) === energySource,
    );

    if (powerProductionsByEnergySource.length > 0) {
      const productionPowerBatches: ProofOfOriginBatchEntity[] = getPowerBatchEntities(
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
