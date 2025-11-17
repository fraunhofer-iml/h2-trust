/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType } from '@h2-trust/domain';
import { HydrogenComponentDto } from '../process-step';
import { EmissionDto } from './emission.dto';
import { BatchDto } from './batch.dto';

export class HydrogenBatchDto extends BatchDto {
  amountVerified: number;
  producer: string;
  unitId: string;
  purity: number;
  typeOfProduction: string;
  hydrogenComposition: HydrogenComponentDto[];
  color: string;
  rfnboReady: boolean;
  processStep: string;

  // optional for all bottled batches, since bottled batches only have a creation/bottling time and no accounting period
  accountingPeriodEnd?: Date;

  constructor(
    id: string,
    emission: EmissionDto,
    creationDate: Date,
    amount: number,
    unit: string,
    amountVerified: number,
    producer: string,
    unitId: string,
    purity: number,
    typeOfProduction: string,
    hydrogenComposition: HydrogenComponentDto[],
    color: string,
    rfnboReady: boolean,
    processStep: string,
    accountingPeriodEnd?: Date,
  ) {
    super(id, emission, creationDate, amount, unit, BatchType.HYDROGEN);
    this.amountVerified = amountVerified;
    this.producer = producer;
    this.unitId = unitId;
    this.purity = purity;
    this.typeOfProduction = typeOfProduction;
    this.hydrogenComposition = hydrogenComposition;
    this.color = color;
    this.rfnboReady = rfnboReady;
    this.processStep = processStep;
    this.accountingPeriodEnd = accountingPeriodEnd;
  }
}
