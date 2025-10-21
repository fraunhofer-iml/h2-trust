/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { TransportationDetailsDbType } from '@h2-trust/database';

export class TransportationDetailsEntity {
  id?: string;
  distance: number;
  transportMode: string;
  fuelType?: string;

  constructor(id: string, distance: number, transportMode: string, fuelType: string) {
    this.id = id;
    this.distance = distance;
    this.transportMode = transportMode;
    this.fuelType = fuelType;
  }

  static fromDatabase(transportationDetails: TransportationDetailsDbType): TransportationDetailsEntity {
    return <TransportationDetailsEntity>{
      id: transportationDetails.id,
      distance: transportationDetails.distance.toNumber() ?? 0,
      transportMode: transportationDetails.transportMode,
      fuelType: transportationDetails.fuelType,
    };
  }
}
