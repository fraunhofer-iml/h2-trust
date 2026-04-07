/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export class ProductionStatisticsEntity {
  hydrogen: HydrogenStatisticsEntity;
  power: PowerStatisticsEntity;

  constructor(hydrogen: HydrogenStatisticsEntity, power: PowerStatisticsEntity) {
    this.hydrogen = hydrogen;
    this.power = power;
  }
}

export class HydrogenStatisticsEntity {
  total: number;
  nonCertifiable: number;
  rfnboReady: number;

  constructor(nonCertifiable: number, rfnboReady: number) {
    this.nonCertifiable = nonCertifiable;
    this.rfnboReady = rfnboReady;
    this.total = nonCertifiable + rfnboReady;
  }
}

export class PowerStatisticsEntity {
  total: number;
  renewable: number;
  partlyRenewable: number;
  nonRenewable: number;

  constructor(renewable: number, partlyRenewable: number, nonRenewable: number) {
    this.renewable = renewable;
    this.partlyRenewable = partlyRenewable;
    this.nonRenewable = nonRenewable;
    this.total = renewable + partlyRenewable + nonRenewable;
  }
}
