/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty } from '@nestjs/swagger';
import { FuelType, RfnboType, TransportType } from '@h2-trust/domain';

const bottlingExampleDefaults = {
  amount: 1,
  rfnboType: 'RFNBO_READY',
  recipient: 'company-recipient-1',
  filledAt: '2025-04-07T00:00:00.000Z',
  recordedBy: 'user-id-1',
  hydrogenStorageUnit: 'hydrogen-storage-unit-1',
  transportMode: 'TRAILER',
  distance: 1000,
  fuelType: 'DIESEL',
} as const;

export class CreateBottlingFormDataDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Files to be uploaded',
  })
  files?: Express.Multer.File[];

  @ApiProperty({
    example: bottlingExampleDefaults.amount,
    description: 'Amount of bottled hydrogen',
  })
  amount: number;

  @ApiProperty({
    example: bottlingExampleDefaults.recipient,
    description: 'ID of the recipient company',
  })
  recipient: string;

  @ApiProperty({
    example: bottlingExampleDefaults.filledAt,
    description: 'Timestamp of bottling (ISO-8601)',
  })
  filledAt: string;

  @ApiProperty({
    example: bottlingExampleDefaults.recordedBy,
    description: 'ID of the user who recorded the process',
  })
  recordedBy: string;

  @ApiProperty({
    example: bottlingExampleDefaults.hydrogenStorageUnit,
    description: 'ID of the hydrogen storage unit',
  })
  hydrogenStorageUnit: string;

  @ApiProperty({
    enum: RfnboType,
    example: bottlingExampleDefaults.rfnboType,
    description: 'RFNBO type',
  })
  rfnboType: RfnboType;

  @ApiProperty({
    enum: TransportType,
    example: bottlingExampleDefaults.transportMode,
    description: 'Transport mode',
  })
  transportMode: TransportType;

  @ApiProperty({
    example: bottlingExampleDefaults.distance,
    description: 'Transport distance in km (only relevant for TRAILER)',
  })
  distance?: number;

  @ApiProperty({
    enum: FuelType,
    example: bottlingExampleDefaults.fuelType,
    description: 'Fuel type (only relevant for TRAILER)',
  })
  fuelType?: FuelType;
}