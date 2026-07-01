/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProcessType } from '@h2-trust/domain';
import { CreateProcessStepDetailsDto } from './create-process-step-details.dto';

export class CreateProcessStepDto {
  @IsEnum(ProcessType)
  @IsNotEmpty()
  @ApiProperty({
    enum: ProcessType,
    example: 'POWER_PRODUCTION',
    description: 'Process type',
  })
  processType: ProcessType;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @ApiProperty({
    example: 1000,
    description: 'Amount of bottled hydrogen',
  })
  amount: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'company-recipient-1',
    description: 'ID of the recipient company',
  })
  recipient: string;

  @IsNotEmpty()
  @IsISO8601()
  @ApiProperty({
    example: '2025-04-07T00:00:00.000Z',
    description: 'Timestamp of bottling (ISO-8601)',
  })
  filledAt: string;

  @IsString()
  @ApiProperty({
    example: 'user-id-1',
    description: 'ID of the user who recorded the process',
  })
  recordedBy: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'unit-id-1',
    description: 'ID of the unit that executed the process',
  })
  executingUnitId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'unit-id-1',
    description:
      'ID of the unit that executed the processes that should be used as predecessors for the new process step',
  })
  predecessorUnitId: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Files to be uploaded',
  })
  files?: Express.Multer.File[];

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const rawJson = JSON.parse(value);
        return plainToInstance(CreateProcessStepDetailsDto, rawJson);
      } catch {
        return value;
      }
    }
    return value;
  })
  @ValidateNested()
  @Type(() => CreateProcessStepDetailsDto)
  details: CreateProcessStepDetailsDto;

  constructor(
    processType: ProcessType,
    amount: number,
    recipient: string,
    filledAt: string,
    recordedBy: string,
    executingUnitId: string,
    predecessorUnitId: string,
    details: CreateProcessStepDetailsDto,
    files?: Express.Multer.File[],
  ) {
    this.processType = processType;
    this.amount = amount;
    this.recipient = recipient;
    this.filledAt = filledAt;
    this.recordedBy = recordedBy;
    this.executingUnitId = executingUnitId;
    this.predecessorUnitId = predecessorUnitId;
    this.files = files;
    this.details = details;
  }
}
