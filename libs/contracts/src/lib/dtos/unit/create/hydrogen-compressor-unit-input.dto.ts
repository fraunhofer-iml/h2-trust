/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AddressPayload, CreateHydrogenCompressorUnitPayload } from '@h2-trust/contracts/payloads';
import { UnitInputDto } from './unit-input.dto';

export class HydrogenCompressorUnitInputDto extends UnitInputDto {
  static toPayload(
    dto: HydrogenCompressorUnitInputDto,
    id?: string,
    requesterCompanyId?: string,
  ): CreateHydrogenCompressorUnitPayload {
    const payload = new CreateHydrogenCompressorUnitPayload(
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
      id,
    );
    payload.requesterCompanyId = requesterCompanyId;
    return payload;
  }
}
