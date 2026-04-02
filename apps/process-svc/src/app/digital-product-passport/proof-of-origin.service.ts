/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import {
  BrokerException,
  HydrogenComponentEntity,
  HydrogenCompositionUtil,
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginSectionEntity,
  ProvenanceEntity,
} from '@h2-trust/amqp';
import { ProcessType, ProofOfOrigin, RfnboType } from '@h2-trust/domain';
import { HydrogenBottlingProofOfOriginService } from './proof-of-origin/hydrogen-bottling-proof-of-origin.service';
import { HydrogenProductionProofOfOriginService } from './proof-of-origin/hydrogen-production-proof-of-origin.service';
import { HydrogenStorageroofOfOriginService } from './proof-of-origin/hydrogen-storage-proof-of-origin.service';
import { HydrogenTransportationProofOfOriginService } from './proof-of-origin/hydrogen-transportation-proof-of-origin.service';

@Injectable()
export class ProofOfOriginService {
  public createProofOfOrigin(provenance: ProvenanceEntity): ProofOfOriginSectionEntity[] {
    if (
      provenance.root.type != ProcessType.HYDROGEN_BOTTLING &&
      provenance.root.type != ProcessType.HYDROGEN_TRANSPORTATION
    ) {
      const errorMessage = `The specified process step ${provenance.root.id} is neither HYDROGEN_BOTTLING nor HYDROGEN_TRANSPORTATION, but of type ${provenance.root.type}`;
      throw Error(errorMessage);
    }

    const proofOfOrigin: ProofOfOriginSectionEntity[] = [];

    let hydrogenComponentsOfBottling: HydrogenComponentEntity[] = this.assembleCompositionForBottling(provenance);

    //build hydrogen production section
    if (provenance.getAllPowerProductions()?.length || provenance.getAllWaterConsumptions()?.length) {
      const hydrogenProductionSection: ProofOfOriginSectionEntity =
        HydrogenProductionProofOfOriginService.buildHydrogenProductionSection(
          provenance.getAllPowerProductions(),
          provenance.getAllWaterConsumptions(),
          provenance.hydrogenBottling.batch.amount,
        );
      proofOfOrigin.push(hydrogenProductionSection);
    }

    //build storage section
    if (provenance.getAllHydrogenLeafProductions()?.length) {
      const hydrogenStorageSection: ProofOfOriginSectionEntity =
        HydrogenStorageroofOfOriginService.assembleHydrogenStorageSection(provenance.getAllHydrogenLeafProductions());
      proofOfOrigin.push(hydrogenStorageSection);
    }

    //build bottling section for rootType=HYDROGEN_BOTTLING
    if (provenance.root.type === ProcessType.HYDROGEN_BOTTLING) {
      const hydrogenBottlingSection: ProofOfOriginSectionEntity =
        HydrogenBottlingProofOfOriginService.assembleHydrogenBottlingSection(
          provenance.root,
          hydrogenComponentsOfBottling,
        );
      proofOfOrigin.push(hydrogenBottlingSection);
    }

    //build bottling section for rootType=HYDROGEN_TRANSPORTATION
    if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      const hydrogenBottlingSection: ProofOfOriginSectionEntity =
        HydrogenBottlingProofOfOriginService.assembleHydrogenBottlingSection(
          provenance.hydrogenBottling,
          hydrogenComponentsOfBottling,
        );
      proofOfOrigin.push(hydrogenBottlingSection);
    }

    //build transport section for rootType=HYDROGEN_TRANSPORTATION
    if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION && provenance.hydrogenBottling) {
      const hydrogenTransportationSection: ProofOfOriginSectionEntity =
        HydrogenTransportationProofOfOriginService.assembleHydrogenTransportationSection(
          provenance.root,
          hydrogenComponentsOfBottling,
        );
      proofOfOrigin.push(hydrogenTransportationSection);
    }

    return proofOfOrigin;
  }

  public getHydrogenBottling(proofOfOrigin: ProofOfOriginSectionEntity[]): ProofOfOriginHydrogenBatchEntity {
    return proofOfOrigin.find((section) => section.name == ProofOfOrigin.HYDROGEN_BOTTLING_SECTION)
      .batches[0] as ProofOfOriginHydrogenBatchEntity;
  }

  /**
   * Create Hydrogen components from the root Hydrogen productions.
   * @param provenance
   * @returns
   */
  public assembleCompositionForBottling(provenance: ProvenanceEntity): HydrogenComponentEntity[] {
    if (!provenance.hydrogenBottling) {
      const errorMessage = `There is no hydrogen bottling in provenance.`;
      throw Error(errorMessage);
    }
    if (provenance.getAllHydrogenLeafProductions()?.length === 0) {
      const errorMessage = `There are no Hydrogen Root Productions in Provenance.`;
      throw Error(errorMessage);
    }
    if (
      provenance.root.type !== ProcessType.HYDROGEN_BOTTLING &&
      provenance.root.type !== ProcessType.HYDROGEN_TRANSPORTATION
    ) {
      const errorMessage = `The process step ${provenance.root.id} should be type ${ProcessType.HYDROGEN_BOTTLING} or ${ProcessType.HYDROGEN_TRANSPORTATION}, but is ${provenance.root.type}.`;
      throw new BrokerException(errorMessage, HttpStatus.BAD_REQUEST);
    }

    //Since we are calculating the Hydrogen Components for the bottling we use the bottled amount here.
    const bottlingBatchAmount = provenance.hydrogenBottling.batch.amount;

    const hydrogenComponentsOfProductions = provenance
      .getAllHydrogenLeafProductions()
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
}
