/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  HydrogenComponentEntity,
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginSectionEntity,
  ProvenanceEntity,
} from '@h2-trust/amqp';
import { ProofOfOrigin } from '@h2-trust/domain';
import { proofOfOriginAssemblers } from './proof-of-origin-assembler.registry.const';

@Injectable()
export class ProofOfOriginService {
  /**
   * If the provided provenance relates to hydrogen bottling or hydrogen transport, the ProofOfOrigin sections for all nodes must be returned.
   * If the root of the provenance is something other than a bottling or a transport, then a PoO cannot be calculated and an empty list is returned.
   * @param provenance The provenance, which tracks the entire production chain of a BOTTLING or a TRANSPORTATION.
   * @returns A list of the ProofOfOrigin sections for all production steps shown in the provenance or an empty list if it is not a bottling or a transport.
   */
  public createProofOfOrigin(provenance: ProvenanceEntity): ProofOfOriginSectionEntity[] {
    return proofOfOriginAssemblers.flatMap((proofOfOriginAssembler) =>
      proofOfOriginAssembler.assembleSection(provenance),
    );
  }

  public getHydrogenBottlingCompositions(proofOfOrigin: ProofOfOriginSectionEntity[]): HydrogenComponentEntity[] {
    const bottling: ProofOfOriginSectionEntity = proofOfOrigin.find(
      (section) => section.name == ProofOfOrigin.HYDROGEN_BOTTLING_SECTION,
    );
    return bottling ? (bottling.batches[0] as ProofOfOriginHydrogenBatchEntity).hydrogenComposition : [];
  }
}
