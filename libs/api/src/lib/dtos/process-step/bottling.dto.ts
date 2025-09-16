/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transform } from 'class-transformer';
import { IsIn, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { BatchEntity, CompanyEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { FuelType, HydrogenColor, TransportMode } from '../../enums';

export class BottlingDto {
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

  @IsNotEmpty()
  @IsString()
  hydrogenStorageUnit: string;

  @IsNotEmpty()
  @IsString()
  @IsIn([HydrogenColor.GREEN, HydrogenColor.MIX])
  color: string;

  file?: string;

  @IsOptional()
  @IsString()
  fileDescription?: string;

  @IsNotEmpty()
  @IsIn([TransportMode.TRAILER, TransportMode.PIPELINE])
  transportMode: TransportMode;

  @IsOptional()
  fuelType?: FuelType;

  constructor(
    amount: number,
    recipient: string,
    filledAt: string,
    recordedBy: string,
    hydrogenStorageUnit: string,
    file: string,
    fileDescription: string,
    color: string,
    transportMode: TransportMode,
    fuelType: FuelType,
  ) {
    this.amount = amount;
    this.recipient = recipient;
    this.filledAt = filledAt;
    this.recordedBy = recordedBy;
    this.hydrogenStorageUnit = hydrogenStorageUnit;
    this.file = file;
    this.fileDescription = fileDescription;
    this.color = color;
    this.transportMode = transportMode;
    this.fuelType = fuelType;
  }

  static toEntity(dto: BottlingDto): ProcessStepEntity {
    const validDate = dto.filledAt ? new Date(dto.filledAt) : null;

    return <ProcessStepEntity>{
      startedAt: validDate,
      endedAt: validDate,
      batch: <BatchEntity>{
        amount: dto.amount,
        quality: `{"color":"${dto.color}"}`,
        owner: <CompanyEntity>{
          id: dto.recipient,
        },
      },
      recordedBy: {
        id: dto.recordedBy,
      },
      executedBy: {
        id: dto.hydrogenStorageUnit,
      },
      documents: [
        {
          description: dto.fileDescription,
        },
      ],
    };
  }
}
