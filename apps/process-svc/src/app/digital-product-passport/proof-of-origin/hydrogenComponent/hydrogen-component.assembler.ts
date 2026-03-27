/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { BrokerException, HydrogenComponentEntity, HydrogenCompositionUtil, ProvenanceEntity } from '@h2-trust/amqp';
import { ProcessType, RfnboType } from '@h2-trust/domain';

export class HydrogenComponentAssembler {
  /**
   * Create Hydrogen components from the root Hydrogen productions.
   * @param provenance
   * @returns
   */
  public static assembleCompositionForBottling(provenance: ProvenanceEntity): HydrogenComponentEntity[] {
    if (!provenance.hydrogenBottling) {
      const errorMessage = `There is no hydrogen bottling in provenance.`;
      throw Error(errorMessage);
    }
    if (provenance.hydrogenProductions?.length === 0) {
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

    const hydrogenComponentsOfProductions = provenance.hydrogenProductions.map(
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
