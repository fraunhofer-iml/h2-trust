/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, HydrogenColor } from '@h2-trust/domain';
import { HydrogenComponentEntity } from '../bottling';
import { RedComplianceEntity } from '../compliance';
import { DocumentEntity } from '../document';
import { ProofOfOriginSectionEntity } from './proof-of-origin';
import { ProofOfSustainabilityEntity } from './proof-of-sustainability';

export class DigitalProductPassportEntity {
  id: string;
  filledAt: Date;
  owner?: string;
  filledAmount?: number;
  color?: string;
  producer?: string;
  product: string;
  hydrogenComposition: HydrogenComponentEntity[];
  attachedFiles: DocumentEntity[];
  redCompliance: RedComplianceEntity;
  isEmissionReductionAbove70Percent: boolean;
  rfnboReady: boolean;
  proofOfSustainability: ProofOfSustainabilityEntity;
  proofOfOrigin: ProofOfOriginSectionEntity[];
  gridPowerUsed: boolean;

  constructor(
    id: string,
    timestamp: Date,
    owner: string,
    filledAmount: number,
    color: string,
    producer: string,
    hydrogenComposition: HydrogenComponentEntity[],
    attachedFiles: DocumentEntity[],
    redCompliance: RedComplianceEntity,
    proofOfSustainability: ProofOfSustainabilityEntity,
    proofOfOrigin: ProofOfOriginSectionEntity[],
  ) {
    this.id = id;
    this.filledAt = timestamp;
    this.owner = owner;
    this.filledAmount = filledAmount;
    this.color = color;
    this.producer = producer;
    this.hydrogenComposition = hydrogenComposition;
    this.product = BatchType.HYDROGEN;
    this.attachedFiles = attachedFiles;
    this.redCompliance = redCompliance;
    this.proofOfOrigin = proofOfOrigin;
    this.proofOfSustainability = proofOfSustainability;
    this.isEmissionReductionAbove70Percent = proofOfSustainability.emissionReductionPercentage > 70;
    this.rfnboReady =
      this.isEmissionReductionAbove70Percent &&
      this.redCompliance.isGeoCorrelationValid &&
      this.redCompliance.isTimeCorrelationValid &&
      this.redCompliance.isAdditionalityFulfilled &&
      this.redCompliance.financialSupportReceived;
    this.gridPowerUsed = hydrogenComposition.some(
      (element: HydrogenComponentEntity) => element.color === HydrogenColor.YELLOW,
    );
  }
}
