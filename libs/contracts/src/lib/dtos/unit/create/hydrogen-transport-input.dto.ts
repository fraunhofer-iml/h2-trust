/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { AddressPayload } from '@h2-trust/contracts/payloads';
import { FuelType, TransportType, UnitType } from '@h2-trust/domain';
import { CreateHydrogenTransportUnitPayload } from '../../../payloads/unit/create-hydrogen-transport-unit.payload';
import { AddressDto } from '../../address';
import { UnitInputDto } from './unit-input.dto';

export class HydrogenTransportUnitInputDto extends UnitInputDto {
  @IsEnum(TransportType)
  @IsNotEmpty()
  transportType: TransportType;

  @ValidateIf((dto) => dto.transportType === TransportType.TRAILER)
  @IsEnum(FuelType)
  @IsNotEmpty()
  fuelType?: FuelType;

  constructor(
    type: UnitType,
    name: string,
    owner: string,
    operator: string,
    manufacturer: string,
    modelType: string,
    modelNumber: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    address: AddressDto,
    transportType: TransportType,
    fuelType?: FuelType,
  ) {
    super(
      type,
      name,
      owner,
      operator,
      manufacturer,
      modelType,
      modelNumber,
      serialNumber,
      certifiedBy,
      commissionedOn,
      address,
    );
    this.transportType = transportType;
    this.fuelType = fuelType;
  }

  static toPayload(
    dto: HydrogenTransportUnitInputDto,
    id?: string,
    requesterCompanyId?: string,
  ): CreateHydrogenTransportUnitPayload {
    const payload = new CreateHydrogenTransportUnitPayload(
      dto.name,
      dto.commissionedOn,
      new AddressPayload(
        dto.address.street,
        dto.address.postalCode,
        dto.address.city,
        dto.address.state,
        dto.address.country,
      ),
      dto.owner,
      dto.manufacturer,
      dto.modelType,
      dto.modelNumber,
      dto.serialNumber,
      dto.certifiedBy,
      dto.operator,
      dto.transportType,
      dto.fuelType,
      id,
    );
    payload.requesterCompanyId = requesterCompanyId;
    return payload;
  }
}
