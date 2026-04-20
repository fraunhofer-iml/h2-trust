/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import {
  HydrogenComponentEntity,
  HydrogenCompositionUtil,
  ProofOfOriginEmissionEntity,
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts';
import { BatchType, ProcessType, ProofOfOrigin, RfnboType } from '@h2-trust/domain';
import { assembleHydrogenBottlingEmissionCalculation } from '../proof-of-sustainability/hydrogen-bottling-proof-of-sustainability.assembler';
import { ProofOfOriginAssembler } from './proof-of-origin-assembler.interface';
import { BrokerException } from '@h2-trust/amqp';

/**
 * Calculates the hydrogen components of the bottling as a proportion of the total volume bottled.
 * @param provenance The provenance, which covers the entire production chain from power, water and hydrogen production right through to bottling and transportation.
 * @returns The volume of HydrogenComponents filled in relation to the total volume filled.
 */
function assembleCompositionForBottling(provenance: ProvenanceEntity): HydrogenComponentEntity[] {
  if (!provenance.hydrogenBottling) {
    const errorMessage = `There is no hydrogen bottling in provenance.`;
    throw Error(errorMessage);
  }
  if (provenance.getAllHydrogenLeafProductions()?.length === 0) {
    const errorMessage = `There are no hydrogen productions in Provenance.`;
    throw Error(errorMessage);
  }
  if (
    provenance.root.type !== ProcessType.HYDROGEN_BOTTLING &&
    provenance.root.type !== ProcessType.HYDROGEN_TRANSPORTATION
  ) {
    const errorMessage = `The process step ${provenance.root.id} should be type ${ProcessType.HYDROGEN_BOTTLING} or ${ProcessType.HYDROGEN_TRANSPORTATION}, but is ${provenance.root.type}.`;
    throw new BrokerException(errorMessage, HttpStatus.BAD_REQUEST);
  }

  const bottlingBatchAmount = provenance.hydrogenBottling.batch.amount;

  const hydrogenComponentsOfProductions = provenance
    .getAllHydrogenRootProductions()
    .map(
      (hydrogenRootProduction) =>
        new HydrogenComponentEntity(
          '',
          hydrogenRootProduction.batch.qualityDetails?.color,
          hydrogenRootProduction.batch.amount,
          hydrogenRootProduction.batch.qualityDetails?.rfnboType ?? RfnboType.NOT_SPECIFIED,
        ),
    );

  return HydrogenCompositionUtil.computeHydrogenComposition(hydrogenComponentsOfProductions, bottlingBatchAmount);
}

export function assembleHydrogenBottlingSection(provenance: ProvenanceEntity): ProofOfOriginSectionEntity[] {
  if (!provenance.hydrogenBottling) {
    return [];
  }

  const hydrogenComponentsOfBottling: HydrogenComponentEntity[] = assembleCompositionForBottling(provenance);
  const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
    assembleHydrogenBottlingEmissionCalculation(provenance.hydrogenBottling);

  const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
    provenance.hydrogenBottling.batch.amount,
    emissionCalculation.result,
    emissionCalculation.basisOfCalculation,
  );

  const batch: ProofOfOriginHydrogenBatchEntity = {
    id: provenance.hydrogenBottling.batch.id,
    emission,
    createdAt: provenance.hydrogenBottling.startedAt,
    amount: provenance.hydrogenBottling.batch.amount,
    batchType: BatchType.HYDROGEN,
    hydrogenComposition: hydrogenComponentsOfBottling,
    unitId: provenance.hydrogenBottling.executedBy.id,
    color: provenance.hydrogenBottling.batch?.qualityDetails?.color,
    rfnboType: provenance.hydrogenBottling.batch?.qualityDetails?.rfnboType,
    processStep: provenance.hydrogenBottling.type,
    accountingPeriodEnd: provenance.hydrogenBottling.endedAt,
  };

  return [new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_BOTTLING_SECTION, [batch], [])];
}

export const hydrogenBottlingProofOfOriginAssembler: ProofOfOriginAssembler = {
  assembleSection: assembleHydrogenBottlingSection,
};
