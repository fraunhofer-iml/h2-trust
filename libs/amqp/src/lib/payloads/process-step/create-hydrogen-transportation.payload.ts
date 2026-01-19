/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, ValidateIf } from 'class-validator';
import { FuelType, TransportMode } from '@h2-trust/domain';
import { BatchEntity, ProcessStepEntity } from '../../entities';

export class CreateHydrogenTransportationPayload {
  @IsNotEmpty()
  @Type(() => ProcessStepEntity)
  processStep: ProcessStepEntity;

  @IsNotEmpty()
  @Type(() => BatchEntity)
  predecessorBatch: BatchEntity;

  @IsEnum(TransportMode)
  @IsNotEmpty()
  transportMode: TransportMode;

  @ValidateIf((o) => o.transportMode === TransportMode.TRAILER)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  distance?: number;

  @ValidateIf((o) => o.transportMode === TransportMode.TRAILER)
  @IsEnum(FuelType)
  @IsOptional()
  fuelType?: FuelType;

  constructor(
    processStep: ProcessStepEntity,
    predecessorBatch: BatchEntity,
    transportMode: TransportMode,
    distance: number,
    fuelType: FuelType,
  ) {
    this.processStep = processStep;
    this.predecessorBatch = predecessorBatch;
    this.transportMode = transportMode;
    this.distance = distance;
    this.fuelType = fuelType;
  }
}
