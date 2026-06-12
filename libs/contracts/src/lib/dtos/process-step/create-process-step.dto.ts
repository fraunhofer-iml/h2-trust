/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ProcessType } from '@h2-trust/domain';
import { CreateQualityDetailsDto } from './create-quality-details.dto';

export class CreateProcessStepDto {
  @IsNotEmpty()
  qualityDetails: CreateQualityDetailsDto;

  @IsEnum(ProcessType)
  @IsNotEmpty()
  processType: ProcessType;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  amount: number;

  @IsNotEmpty()
  @IsString()
  recipient: string;

  @IsNotEmpty()
  @IsISO8601()
  filledAt: string;

  @IsString()
  recordedBy: string;

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
    qualityDetails: CreateQualityDetailsDto,
    processType: ProcessType,
    amount: number,
    recipient: string,
    filledAt: string,
    recordedBy: string,
    executingUnitId: string,
    predecessorUnitId: string,
    files?: Express.Multer.File[],
  ) {
    this.qualityDetails = qualityDetails;
    this.processType = processType;
    this.amount = amount;
    this.recipient = recipient;
    this.filledAt = filledAt;
    this.recordedBy = recordedBy;
    this.executingUnitId = executingUnitId;
    this.predecessorUnitId = predecessorUnitId;
    this.files = files;
  }
}
