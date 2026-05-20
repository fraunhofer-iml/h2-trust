/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity, ProvenanceEntity } from '@h2-trust/contracts/entities';
import { ProcessType, RfnboType } from '@h2-trust/domain';
import { DomainException, ErrorCode, InternalException } from '@h2-trust/exceptions';

/**
 * Calculates the hydrogen components of the bottling as a proportion of the total volume bottled.
 * @param provenance The provenance, which covers the entire production chain from power, water and hydrogen production right through to bottling and transportation.
 * @returns The volume of HydrogenComponents filled in relation to the total volume filled.
 */
export function assembleComposition(provenance: ProvenanceEntity): HydrogenComponentEntity[] {
  if (!provenance.hydrogenBottling) {
    throw new InternalException('There is no hydrogen bottling in provenance.');
  }
  if (provenance.getAllHydrogenLeafProductions().length === 0) {
    throw new InternalException('There are no hydrogen productions in provenance.');
  }
  if (
    provenance.root.type !== ProcessType.HYDROGEN_BOTTLING &&
    provenance.root.type !== ProcessType.HYDROGEN_TRANSPORTATION
  ) {
    throw new InternalException(
      `The process step ${provenance.root.id} should be type ${ProcessType.HYDROGEN_BOTTLING} or ${ProcessType.HYDROGEN_TRANSPORTATION}, but is ${provenance.root.type}.`,
    );
  }

  const rootBatchAmount = provenance.root.batch.amount;
  const hydrogenStorageUnitId = provenance.hydrogenBottling.executedBy.id;

  const hydrogenComponentsOfProductions = provenance
    .getAllHydrogenLeafProductions()
    .map(
      (hydrogenLeafProduction) =>
        new HydrogenComponentEntity(
          '',
          hydrogenLeafProduction.batch.amount,
          hydrogenLeafProduction.batch.qualityDetails?.rfnboType ?? RfnboType.NOT_SPECIFIED,
        ),
    );

  return computeHydrogenComposition(hydrogenComponentsOfProductions, rootBatchAmount, hydrogenStorageUnitId);
}

/**
 * Merges a list of HydrogenComponents, so that all components are grouped together with the same RFNBO type.
 * Then sets the amount of each grouped HydrogenComponent to an amount value according to the requested bottleAmount.
 * @param hydrogenComponents The HydrogenComponents, that should be grouped.
 * @param bottleAmount The requested bottle Amount.
 * @param hydrogenStorageUnitId The ID of the hydrogen storage unit (included in error context).
 * @returns The merged list of HydrogenComponents, where each RFNBO type only exists once.
 */
export function computeHydrogenComposition(
  hydrogenComponents: HydrogenComponentEntity[],
  bottleAmount: number,
  hydrogenStorageUnitId: string,
): HydrogenComponentEntity[] {
  //The list of HydrogenComponents merged according to their RFNBO Type
  const mergedHydrogenComponents = hydrogenComponents.reduce<HydrogenComponentEntity[]>(mergeSingleComponent, []);

  const totalAmount = mergedHydrogenComponents.reduce((sum, item) => sum + item.amount, 0);
  if (totalAmount <= 0) {
    throw new DomainException(
      ErrorCode.DOMAIN_BUSINESS_RULE_VIOLATION,
      `Total stored amount of storage unit '${hydrogenStorageUnitId}' is not greater than 0`,
    );
  }

  return mergedHydrogenComponents.map(
    ({ processId, amount, rfnboType }) =>
      new HydrogenComponentEntity(processId, (bottleAmount * amount) / totalAmount, rfnboType),
  );
}

/**
 * Merges a new HydrogenComponent into a list of HydrogenComponents according to the RFNBO status.
 * @param combinedComponents The list of combined HydrogenComponents.
 * @param componentToMerge The new HydrogenComponent that should be added.
 * @returns The updated list including the new HydrogenComponent.
 */
function mergeSingleComponent(
  combinedComponents: HydrogenComponentEntity[],
  componentToMerge: HydrogenComponentEntity,
): HydrogenComponentEntity[] {
  const matchingComponent = combinedComponents.find((c) => c.rfnboType === componentToMerge.rfnboType);

  if (matchingComponent) {
    const updatedComponent = new HydrogenComponentEntity(
      null,
      matchingComponent.amount + componentToMerge.amount,
      matchingComponent.rfnboType,
    );
    return combinedComponents.map((c) => (c.rfnboType === componentToMerge.rfnboType ? updatedComponent : c));
  }

  return [
    ...combinedComponents,
    new HydrogenComponentEntity(null, componentToMerge.amount, componentToMerge.rfnboType),
  ];
}
