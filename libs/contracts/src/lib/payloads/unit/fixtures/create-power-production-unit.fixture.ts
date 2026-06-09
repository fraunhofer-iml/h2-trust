/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreatePowerProductionUnitPayload } from '@h2-trust/contracts/payloads';
import { BiddingZone, PowerProductionType } from '@h2-trust/domain';
import { createBaseCreateUnitPayloadValues } from './unit-payload-defaults';

export const CreatePowerProductionUnitPayloadFixture = {
  create: (overrides: Partial<CreatePowerProductionUnitPayload> = {}): CreatePowerProductionUnitPayload => {
    const defaults = createBaseCreateUnitPayloadValues(overrides);

    return new CreatePowerProductionUnitPayload(
      defaults.name,
      defaults.commissionedOn,
      defaults.address,
      defaults.ownerId,
      overrides.ratedPower ?? 1000,
      overrides.biddingZone ?? BiddingZone.DE_LU,
      overrides.financialSupportReceived ?? false,
      overrides.powerProductionType ?? PowerProductionType.WIND_TURBINE,
      defaults.manufacturer,
      defaults.modelType,
      defaults.modelNumber,
      defaults.serialNumber,
      defaults.certifiedBy,
      defaults.operatorId,
      overrides.decommissioningPlannedOn ?? new Date('2036-01-01T00:00:00Z'),
      defaults.id,
    );
  },
} as const;
