/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { HydrogenComponentEntity, ProofOfOriginSectionEntity, ProvenanceEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { HydrogenComponentAssembler } from './hydrogenComponent/hydrogen-component.assembler';
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

    let hydrogenComponentsOfBottling: HydrogenComponentEntity[] =
      HydrogenComponentAssembler.assembleCompositionForBottling(provenance);

    //build hydrogen production section
    if (provenance.powerProductions?.length || provenance.waterConsumptions?.length) {
      const hydrogenProductionSection: ProofOfOriginSectionEntity =
        HydrogenProductionProofOfOriginService.buildHydrogenProductionSection(
          provenance.powerProductions,
          provenance.waterConsumptions,
          provenance.hydrogenBottling.batch.amount,
        );
      proofOfOrigin.push(hydrogenProductionSection);
    }

    //build storage section
    if (provenance.hydrogenProductions?.length) {
      const hydrogenStorageSection: ProofOfOriginSectionEntity =
        HydrogenStorageroofOfOriginService.assembleHydrogenStorageSection(provenance.hydrogenProductions);
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
}
