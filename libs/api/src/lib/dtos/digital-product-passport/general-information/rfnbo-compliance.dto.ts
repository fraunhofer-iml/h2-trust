/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export abstract class RfnboBaseDto {
  abstract gridPowerUsed: boolean;
  emissionReductionOver70Percent: boolean;
  rfnboReady = false;

  constructor(emissionReductionOver70Percent: boolean) {
    this.emissionReductionOver70Percent = emissionReductionOver70Percent;
  }
}

export class RenewableEnergyRfnboDto extends RfnboBaseDto {
  readonly gridPowerUsed = false;

  geoCorrelationValid: boolean;
  timeCorrelationValid: boolean;
  additionalityFulfilled: boolean;
  financialSupportReceived: boolean;
  constructor(
    emissionReductionOver70Percent: boolean,
    geoCorrelationValid: boolean,
    timeCorrelationValid: boolean,
    additionalityFulfilled: boolean,
    financialSupportReceived: boolean,
  ) {
    super(emissionReductionOver70Percent);
    this.geoCorrelationValid = geoCorrelationValid;
    this.timeCorrelationValid = timeCorrelationValid;
    this.additionalityFulfilled = additionalityFulfilled;
    this.financialSupportReceived = financialSupportReceived;

    this.rfnboReady =
      this.emissionReductionOver70Percent &&
      this.geoCorrelationValid &&
      this.timeCorrelationValid &&
      this.additionalityFulfilled &&
      this.financialSupportReceived;
  }
}
export class GridEnergyRfnboDto extends RfnboBaseDto {
  readonly gridPowerUsed = true;
  // 90% or more renewables in grid mix
  highRenewableShare: boolean;

  // GHG intensity of grid is 18 g CO₂eq/MJ or less
  gridGHGIntensityLow: boolean;

  // Avoid curtailment / redispatchment
  curtailmentAvoided: boolean;
  constructor(
    emissionReductionOver70Percent: boolean,
    hasHighRenewableShare: boolean,
    isGridGHGIntensityLow: boolean,
    isCurtailmentAvoided: boolean,
  ) {
    super(emissionReductionOver70Percent);
    this.highRenewableShare = hasHighRenewableShare;
    this.gridGHGIntensityLow = isGridGHGIntensityLow;
    this.curtailmentAvoided = isCurtailmentAvoided;

    this.rfnboReady =
      this.emissionReductionOver70Percent && hasHighRenewableShare && isGridGHGIntensityLow && isCurtailmentAvoided;
  }
}
