/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { QualityDetails } from '@prisma/client';
import { HydrogenColor, PowerProductionClass, RfnboType } from '@h2-trust/domain';

export const QualityDetailsSeed: readonly QualityDetails[] = Object.freeze([
  {
    id: 'quality-details-produced-0',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.RFNBO_READY,
    powerProductionClass: PowerProductionClass.RENEWABLE,
  },
  {
    id: 'quality-details-produced-1',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.RFNBO_READY,
    powerProductionClass: PowerProductionClass.RENEWABLE,
  },
  {
    id: 'quality-details-produced-2',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NON_CERTIFIABLE,
    powerProductionClass: PowerProductionClass.RENEWABLE,
  },
  {
    id: 'quality-details-produced-3',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NON_CERTIFIABLE,
    powerProductionClass: PowerProductionClass.RENEWABLE,
  },
  {
    id: 'quality-details-produced-4',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NON_CERTIFIABLE,
    powerProductionClass: PowerProductionClass.RENEWABLE,
  },
  {
    id: 'quality-details-produced-5',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NON_CERTIFIABLE,
    powerProductionClass: PowerProductionClass.RENEWABLE,
  },
  {
    id: 'quality-details-produced-6',
    color: HydrogenColor.YELLOW,
    rfnboType: RfnboType.NON_CERTIFIABLE,
    powerProductionClass: PowerProductionClass.NOT_RENEWABLE_GRID,
  },
  {
    id: 'quality-details-produced-7',
    color: HydrogenColor.YELLOW,
    rfnboType: RfnboType.NON_CERTIFIABLE,
    powerProductionClass: PowerProductionClass.RENEWABLE_GRID,
  },
  {
    id: 'quality-details-produced-8',
    color: HydrogenColor.YELLOW,
    rfnboType: RfnboType.NON_CERTIFIABLE,
    powerProductionClass: PowerProductionClass.RENEWABLE_GRID,
  },
  {
    id: 'quality-details-produced-9',
    color: HydrogenColor.YELLOW,
    rfnboType: RfnboType.NON_CERTIFIABLE,
    powerProductionClass: PowerProductionClass.RENEWABLE,
  },
  {
    id: 'quality-details-bottled-10',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.RFNBO_READY,
    powerProductionClass: PowerProductionClass.NOT_SPECIFIED,
  },
  {
    id: 'quality-details-bottled-11',
    color: HydrogenColor.MIX,
    rfnboType: RfnboType.NON_CERTIFIABLE,
    powerProductionClass: PowerProductionClass.NOT_SPECIFIED,
  },
  {
    id: 'quality-details-bottled-12',
    color: HydrogenColor.MIX,
    rfnboType: RfnboType.NON_CERTIFIABLE,
    powerProductionClass: PowerProductionClass.NOT_SPECIFIED,
  },
  {
    id: 'quality-details-transported-13',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NON_CERTIFIABLE,
    powerProductionClass: PowerProductionClass.NOT_SPECIFIED,
  },
  {
    id: 'quality-details-transported-14',
    color: HydrogenColor.MIX,
    rfnboType: RfnboType.NON_CERTIFIABLE,
    powerProductionClass: PowerProductionClass.NOT_SPECIFIED,
  },
  {
    id: 'quality-details-transported-15',
    color: HydrogenColor.MIX,
    rfnboType: RfnboType.NON_CERTIFIABLE,
    powerProductionClass: PowerProductionClass.NOT_SPECIFIED,
  },

  {
    id: 'quality-details-power-0',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NOT_SPECIFIED,
    powerProductionClass: PowerProductionClass.RENEWABLE,
  },
  {
    id: 'quality-details-power-1',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NOT_SPECIFIED,
    powerProductionClass: PowerProductionClass.RENEWABLE,
  },
  {
    id: 'quality-details-power-2',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NOT_SPECIFIED,
    powerProductionClass: PowerProductionClass.RENEWABLE,
  },
  {
    id: 'quality-details-power-3',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NOT_SPECIFIED,
    powerProductionClass: PowerProductionClass.RENEWABLE,
  },
  {
    id: 'quality-details-power-4',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NOT_SPECIFIED,
    powerProductionClass: PowerProductionClass.RENEWABLE,
  },
  {
    id: 'quality-details-power-5',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NOT_SPECIFIED,
    powerProductionClass: PowerProductionClass.RENEWABLE,
  },
  {
    id: 'quality-details-power-6',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NOT_SPECIFIED,
    powerProductionClass: PowerProductionClass.NOT_RENEWABLE_GRID,
  },
  {
    id: 'quality-details-power-7',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NOT_SPECIFIED,
    powerProductionClass: PowerProductionClass.RENEWABLE_GRID,
  },
  {
    id: 'quality-details-power-8',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NOT_SPECIFIED,
    powerProductionClass: PowerProductionClass.RENEWABLE_GRID,
  },
  {
    id: 'quality-details-power-9',
    color: HydrogenColor.GREEN,
    rfnboType: RfnboType.NOT_SPECIFIED,
    powerProductionClass: PowerProductionClass.RENEWABLE,
  },
]);
