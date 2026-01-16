/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { TransportationDetailsDbType } from '@h2-trust/database';
import { FuelType, TransportMode } from '@h2-trust/domain';

export class TransportationDetailsEntity {
  id: string;
  distance: number;
  transportMode: TransportMode;
  fuelType: FuelType | null;

  constructor(id: string, distance: number, transportMode: TransportMode, fuelType: FuelType | null) {
    this.id = id;
    this.distance = distance;
    this.transportMode = transportMode;
    this.fuelType = fuelType;
  }

  static fromDatabase(transportationDetails: TransportationDetailsDbType): TransportationDetailsEntity {
    const fuelType = transportationDetails.fuelType?.toUpperCase() as FuelType;
    const validFuelType = Object.values(FuelType).includes(fuelType) ? fuelType : null;

    return new TransportationDetailsEntity(
      transportationDetails.id,
      transportationDetails.distance.toNumber() ?? 0,
      transportationDetails.transportMode as TransportMode,
      validFuelType,
    );
  }
}
