/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionStatisticsEntity } from '@h2-trust/amqp';

export class ProductionStatisticsDto {
  hydrogen: HydrogenStatisticsDto;
  power: PowerStatisticsDto;

  constructor(hydrogen: HydrogenStatisticsDto, power: PowerStatisticsDto) {
    this.hydrogen = hydrogen;
    this.power = power;
  }

  public static fromEntity(entity: ProductionStatisticsEntity): ProductionStatisticsDto {
    return {
      hydrogen: {
        total: entity.hydrogen.total,
        nonCertifiable: entity.hydrogen.nonCertifiable,
        rfnboReady: entity.hydrogen.rfnboReady,
      } as HydrogenStatisticsDto,
      power: {
        total: entity.power.total,
        nonRenewable: entity.power.nonRenewable,
        partlyRenewable: entity.power.partlyRenewable,
        renewable: entity.power.renewable,
      },
    } as ProductionStatisticsDto;
  }
}

export class HydrogenStatisticsDto {
  total: number;
  nonCertifiable: number;
  rfnboReady: number;

  constructor(nonCertifiable: number, rfnboReady: number) {
    this.nonCertifiable = nonCertifiable;
    this.rfnboReady = rfnboReady;
    this.total = nonCertifiable + rfnboReady;
  }
}

export class PowerStatisticsDto {
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
