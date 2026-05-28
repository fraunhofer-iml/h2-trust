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
} from '@h2-trust/contracts/entities';
import { BatchType, PowerProductionType, PowerType, ProcessType } from '@h2-trust/domain';
import { computePowerSupplyEmissionCalculations } from '../../proof-of-sustainability/emissions/power-production-emission-calculation.assembler';
import { assembleSubClassification } from '../../util';

function getPowerBatchEntities(
  powerProductionProcesses: ProcessStepEntity[],
  bottledKgHydrogen: number,
  powerProductionType: PowerProductionType,
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
      powerProductionType: powerProductionType,
      accountingPeriodEnd: powerProduction.endedAt,
      powerType: powerType,
    };
  });
}

function getPowerProductionType(powerProduction: ProcessStepEntity): PowerProductionType {
  const unit = powerProduction.executedBy as PowerProductionUnitEntity;
  return unit.type;
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

  const occurringEnergySources = [...new Set(powerProductions.map(getPowerProductionType))];

  const subClassifications: ProofOfOriginSubClassificationEntity[] = [];

  for (const energySource of occurringEnergySources) {
    const powerProductionsByEnergySource: ProcessStepEntity[] = powerProductions.filter(
      (powerProduction) => getPowerProductionType(powerProduction) === energySource,
    );

    if (powerProductionsByEnergySource.length > 0) {
      const productionPowerBatches: ProofOfOriginBatchEntity[] = getPowerBatchEntities(
        powerProductionsByEnergySource,
        bottledKgHydrogen,
        energySource,
      );

      const subClassification: ProofOfOriginSubClassificationEntity = assembleSubClassification(
        energySource,
        BatchType.POWER,
        productionPowerBatches,
      );

      subClassifications.push(subClassification);
    }
  }

  return subClassifications;
}
