/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HydrogenComponentEntity,
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginSectionEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts/entities';
import { ProofOfOrigin } from '@h2-trust/domain';
import { proofOfOriginSectionAssemblers } from './proof-of-origin-assembler.registry.const';

/**
 * If the provided provenance relates to hydrogen bottling or hydrogen transport, the ProofOfOrigin sections for all nodes must be returned.
 * If the root of the provenance is something other than a bottling or a transport, then a PoO cannot be calculated and an empty list is returned.
 * @param provenance The provenance, which tracks the entire production chain of a BOTTLING or a TRANSPORTATION.
 * @returns A list of the ProofOfOrigin sections for all production steps shown in the provenance or an empty list if it is not a bottling or a transport.
 */
export function assembleProofOfOrigin(provenance: ProvenanceEntity): ProofOfOriginSectionEntity[] {
  if (!provenance) {
    return [];
  }

  return proofOfOriginSectionAssemblers
    .flatMap((proofOfOriginAssembler) => proofOfOriginAssembler.assembleSection(provenance))
    .sort((a, b) => getProofOfOriginSectionOrder(a.name) - getProofOfOriginSectionOrder(b.name));
}

function getProofOfOriginSectionOrder(name: string): number {
  switch (name) {
    case ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION:
      return 0;
    case ProofOfOrigin.HYDROGEN_STORAGE_SECTION:
      return 1;
    case ProofOfOrigin.HYDROGEN_BOTTLING_SECTION:
      return 2;
    case ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION:
      return 3;
    default:
      return Number.MAX_SAFE_INTEGER;
  }
}

export function getHydrogenBottlingCompositions(
  proofOfOrigin: ProofOfOriginSectionEntity[],
): HydrogenComponentEntity[] {
  if (!proofOfOrigin) {
    return [];
  }

  const bottling: ProofOfOriginSectionEntity = proofOfOrigin.find(
    (section) => section.name === ProofOfOrigin.HYDROGEN_BOTTLING_SECTION,
  );
  return bottling ? (bottling.batches[0] as ProofOfOriginHydrogenBatchEntity).hydrogenComposition : [];
}
