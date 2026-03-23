/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import {
  BatchEntity,
  BrokerException,
  HydrogenComponentEntity,
  HydrogenCompositionUtil,
  ProvenanceEntity,
} from '@h2-trust/amqp';
import { BatchType, ProcessType, RfnboType } from '@h2-trust/domain';

export class HydrogenComponentAssembler {
  /**
   * Retrieves the batches of the predecessor of a BOTTLING or TRANSPORTATION or the batch of a PRODUCTION. Converts these into HydrogenComponents, then combines them into HydrogenComponents with the same RFNBO status and changes their amount to the proportion of the amount to be filled.
   * @param processStep The process step whose batch (or whose predecessor batch) is to be returned as grouped HydrogenComponents.
   * @returns The grouped HydrogenComponents of the process step batch or its predecessors.
   */
  static assemble(provenance: ProvenanceEntity): HydrogenComponentEntity[] {
    let hydrogenComponents: HydrogenComponentEntity[];

    switch (provenance.root.type) {
      case ProcessType.HYDROGEN_BOTTLING:
      case ProcessType.HYDROGEN_TRANSPORTATION:
        hydrogenComponents = this.assembleForBottling(provenance);
        break;
      case ProcessType.HYDROGEN_PRODUCTION:
        hydrogenComponents = this.assembleForHydrogenRootProduction(provenance);
        break;
      default: {
        const errorMessage = `The specified process step ${provenance.root.id} is neither HYDROGEN_BOTTLING, HYDROGEN_TRANSPORTATION nor HYDROGEN_PRODUCTION, but of type ${provenance.root.type}`;
        throw Error(errorMessage);
      }
    }

    return hydrogenComponents;
  }

  private static assembleForBottling(provenance: ProvenanceEntity): HydrogenComponentEntity[] {
    if (!provenance.hydrogenBottling) {
      const errorMessage = `There is no hydrogen bottling in provenance.`;
      throw Error(errorMessage);
    }
    if (provenance.hydrogenProductions?.length === 0) {
      const errorMessage = `There are no Hydrogen Root Productions in Provenance.`;
      throw Error(errorMessage);
    }

    //Since we are calculating the Hydrogen Components for the bottling we use the bottled amount here.
    const bottlingBatchAmount = provenance.hydrogenBottling.batch.amount;

    const hydrogenComponentsOfProductions = provenance.hydrogenProductions.map((hydrogenRootProduction) =>
      HydrogenComponentAssembler.createHydrogenComponentFromBatch(hydrogenRootProduction.batch),
    );

    return HydrogenCompositionUtil.computeHydrogenComposition(hydrogenComponentsOfProductions, bottlingBatchAmount);
  }

  private static assembleForHydrogenRootProduction(provenance: ProvenanceEntity): HydrogenComponentEntity[] {
    if (provenance.hydrogenRootProductions?.length !== 1) {
      const errorMessage = `There should only be 1 hydrogen root production in the provenance.`;
      throw Error(errorMessage);
    }

    //Since the processStep is a Hydrogen Production its predecessors are WATER and POWER and therefore its batch is the only batch we have to take in account here.
    const batchHydrogenComponent: HydrogenComponentEntity = HydrogenComponentAssembler.createHydrogenComponentFromBatch(
      provenance.hydrogenRootProductions[0].batch,
    );

    return HydrogenCompositionUtil.computeHydrogenComposition([batchHydrogenComponent], batchHydrogenComponent.amount);
  }
  private static createHydrogenComponentFromBatch(batch: BatchEntity): HydrogenComponentEntity {
    if (batch.type !== BatchType.HYDROGEN) {
      const errorMessage = `Predecessor batch ${batch.id} should be type ${BatchType.HYDROGEN}, but is ${batch.type}.`;
      throw new BrokerException(errorMessage, HttpStatus.BAD_REQUEST);
    }

    return new HydrogenComponentEntity(
      '',
      batch.qualityDetails?.color,
      batch.amount,
      batch.qualityDetails?.rfnboType ?? RfnboType.NOT_SPECIFIED,
    );
  }
}
