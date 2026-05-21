/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateHydrogenStorageUnitPayload } from '@h2-trust/contracts/payloads';
import { HydrogenStorageType } from '@h2-trust/domain';
import { createBaseCreateUnitPayloadValues } from './unit-payload-defaults';

export const CreateHydrogenStorageUnitPayloadFixture = {
  create: (overrides: Partial<CreateHydrogenStorageUnitPayload> = {}): CreateHydrogenStorageUnitPayload => {
    const defaults = createBaseCreateUnitPayloadValues(overrides);

    return new CreateHydrogenStorageUnitPayload(
      defaults.name,
      defaults.mastrNumber,
      defaults.commissionedOn,
      defaults.address,
      defaults.ownerId,
      overrides.storageType ?? HydrogenStorageType.COMPRESSED_GASEOUS_HYDROGEN,
      overrides.capacity ?? 1000,
      overrides.pressure ?? 200,
      defaults.manufacturer,
      defaults.modelType,
      defaults.modelNumber,
      defaults.serialNumber,
      defaults.certifiedBy,
      defaults.operatorId,
      defaults.id,
    );
  },
} as const;
