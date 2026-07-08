/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProcessStepEntity,
  ProofOfOriginClassificationEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginProductionBatchEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
} from '@h2-trust/contracts/entities';
import { BatchType, ProcessType, ProofOfOrigin } from '@h2-trust/domain';
import { InternalException } from '@h2-trust/exceptions';
import { assembleProductionEmissionCalculations } from '../../proof-of-sustainability/emissions/hydrogen-production-emission-calculation.assembler';
import { assembleClassification } from '../../util';

function getProductionBatchEntities(
  hydrogenProductions: ProcessStepEntity[],
  producedKgHydrogen: number,
): ProofOfOriginProductionBatchEntity[] {
  return hydrogenProductions.map((hydrogenProduction) => {
    const wasteWaterConsumptionOfUnit = hydrogenProduction.executedBy?.details?.wasteWaterConsumptionLitersPerKgH2 ?? 0;
    const wasteWaterConsumptionOfProduction = wasteWaterConsumptionOfUnit * hydrogenProduction.batch.amount;

    const productionEmissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
      assembleProductionEmissionCalculations(hydrogenProduction);

    const productionEmission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
      producedKgHydrogen,
      productionEmissionCalculation.result,
      productionEmissionCalculation.basisOfCalculation,
    );

    const resinConsumptionOfUnit = hydrogenProduction.executedBy?.details?.resinConsumptionKgPerKgH2 ?? 0;
    const resinConsumptionOfProduction = resinConsumptionOfUnit * hydrogenProduction.batch.amount;

    return {
      id: hydrogenProduction.batch.id,
      emission: productionEmission,
      createdAt: hydrogenProduction.startedAt,
      amount: hydrogenProduction.batch.amount,
      batchType: BatchType.H2_PRODUCTION,
      wasteWaterAmount: wasteWaterConsumptionOfProduction,
      resinAmount: resinConsumptionOfProduction,
    };
  });
}

function onlyHydrogenProduction(processSteps: ProcessStepEntity[]) {
  return !processSteps.some((processStep) => processStep.type != ProcessType.HYDROGEN_PRODUCTION);
}

export function assembleHydrogenProductionClassification(
  hydrogenProduction: ProcessStepEntity[],
  producedKgHydrogen: number,
): ProofOfOriginClassificationEntity {
  if (!hydrogenProduction?.length || producedKgHydrogen === 0 || !onlyHydrogenProduction(hydrogenProduction)) {
    const message = 'No process steps of type hydrogen production found.';
    throw new InternalException(message);
  }

  const productionBatches: ProofOfOriginProductionBatchEntity[] = getProductionBatchEntities(
    hydrogenProduction,
    producedKgHydrogen,
  );

  return assembleClassification(
    ProofOfOrigin.HHYDROGEN_PRODUCTION_CLASSIFICATION,
    BatchType.H2_PRODUCTION,
    productionBatches,
    [],
  );
}
