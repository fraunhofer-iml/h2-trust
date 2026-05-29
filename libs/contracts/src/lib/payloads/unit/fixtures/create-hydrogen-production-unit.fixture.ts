/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateHydrogenProductionUnitPayload } from '@h2-trust/contracts/payloads';
import { BiddingZone, HydrogenProductionTechnology, HydrogenProductionType } from '@h2-trust/domain';
import { createBaseCreateUnitPayloadValues } from './unit-payload-defaults';

export const CreateHydrogenProductionUnitPayloadFixture = {
  create: (overrides: Partial<CreateHydrogenProductionUnitPayload> = {}): CreateHydrogenProductionUnitPayload => {
    const defaults = createBaseCreateUnitPayloadValues(overrides);

    return new CreateHydrogenProductionUnitPayload(
      defaults.name,
      defaults.mastrNumber,
      defaults.commissionedOn,
      defaults.address,
      defaults.ownerId,
      overrides.hydrogenProductionType ?? HydrogenProductionType.ELECTROLYSIS,
      overrides.technology ?? HydrogenProductionTechnology.PEM,
      overrides.biddingZone ?? BiddingZone.DE_LU,
      overrides.ratedPower ?? 500,
      overrides.pressure ?? 35,
      overrides.waterConsumptionLitersPerHour ?? 1200,
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
