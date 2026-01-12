/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity } from '../bottling';
import { RedComplianceEntity } from '../compliance';
import { DocumentEntity } from '../document';

export class GeneralInformationEntity {
  id: string;
  filledAt: Date;
  owner?: string;
  filledAmount?: number;
  color?: string;
  producer?: string;
  product: string;
  hydrogenComposition: HydrogenComponentEntity[];
  attachedFiles: DocumentEntity[];
  redCompliance?: RedComplianceEntity;

  constructor(
    id: string,
    filledAt: Date,
    owner: string | undefined,
    filledAmount: number | undefined,
    color: string | undefined,
    producer: string | undefined,
    hydrogenComposition: HydrogenComponentEntity[],
    attachedFiles: DocumentEntity[],
    redCompliance?: RedComplianceEntity,
    product = 'Hydrogen',
  ) {
    this.id = id;
    this.filledAt = filledAt;
    this.owner = owner;
    this.filledAmount = filledAmount;
    this.color = color;
    this.producer = producer;
    this.product = product;
    this.hydrogenComposition = hydrogenComposition;
    this.attachedFiles = attachedFiles;
    this.redCompliance = redCompliance;
  }
}
