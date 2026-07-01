/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ProcessType } from '@h2-trust/domain';
import 'multer';
import { CreateBatchDetailsPayload } from './create-process-step-quality.payload';

export class CreateProcessStepPayload {
  @IsNotEmpty()
  batchDetails: CreateBatchDetailsPayload;

  @IsEnum(ProcessType)
  @IsNotEmpty()
  processType: ProcessType;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startedAt: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endedAt: Date;

  @IsString()
  @IsNotEmpty()
  recordedById: string;

  @IsString()
  @IsNotEmpty()
  executingUnitId: string;

  @IsString()
  @IsNotEmpty()
  predecessorUnitId: string;

  @IsArray()
  @IsOptional()
  files?: Express.Multer.File[];

  constructor(
    batchDetails: CreateBatchDetailsPayload,
    processType: ProcessType,
    amount: number,
    ownerId: string,
    recordedById: string,
    startedAt: Date,
    endedAt: Date,
    executingUnitId: string,
    predecessorUnitId: string,
    files?: Express.Multer.File[],
  ) {
    this.batchDetails = batchDetails;
    this.processType = processType;
    this.amount = amount;
    this.ownerId = ownerId;
    this.recordedById = recordedById;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.executingUnitId = executingUnitId;
    this.predecessorUnitId = predecessorUnitId;
    this.files = files;
  }
}
