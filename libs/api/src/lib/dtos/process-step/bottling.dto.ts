/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transform } from 'class-transformer';
import { IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateIf } from 'class-validator';
import { BatchEntity, CompanyEntity, ProcessStepEntity, QualityDetailsEntity } from '@h2-trust/amqp';
import { FuelType, HydrogenColor, TransportMode } from '@h2-trust/domain';

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
  @IsEnum(HydrogenColor)
  color: HydrogenColor;

  @IsOptional()
  @IsString()
  file?: string;

  @IsNotEmpty()
  @IsEnum(TransportMode)
  transportMode: TransportMode;

  @ValidateIf((o) => o.transportMode === TransportMode.TRAILER)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  distance?: number;

  @ValidateIf((o) => o.transportMode === TransportMode.TRAILER)
  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  constructor(
    amount: number,
    recipient: string,
    filledAt: string,
    recordedBy: string,
    hydrogenStorageUnit: string,
    color: HydrogenColor,
    file: string,
    transportMode: TransportMode,
    distance: number,
    fuelType: FuelType,
  ) {
    this.amount = amount;
    this.recipient = recipient;
    this.filledAt = filledAt;
    this.recordedBy = recordedBy;
    this.hydrogenStorageUnit = hydrogenStorageUnit;
    this.color = color;
    this.file = file;
    this.transportMode = transportMode;
    this.distance = distance;
    this.fuelType = fuelType;
  }

  static toEntity(dto: BottlingDto): ProcessStepEntity {
    const validDate = dto.filledAt ? new Date(dto.filledAt) : null;

    return <ProcessStepEntity>{
      startedAt: validDate,
      endedAt: validDate,
      batch: <BatchEntity>{
        amount: dto.amount,
        owner: <CompanyEntity>{
          id: dto.recipient,
        },
        qualityDetails: <QualityDetailsEntity>{
          color: dto.color,
        },
      },
      recordedBy: {
        id: dto.recordedBy,
      },
      executedBy: {
        id: dto.hydrogenStorageUnit,
      },
    };
  }
}
