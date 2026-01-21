/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export abstract class RfnboBaseDto {
  abstract gridPowerUsed: boolean;
  isReductionOver70Percent: boolean;
  isRfnboReady = false;

  constructor(isReductionOver70Percent: boolean) {
    this.isReductionOver70Percent = isReductionOver70Percent;
  }
}

export class RenewableEnergyRfnboDto extends RfnboBaseDto {
  readonly gridPowerUsed = false;

  isGeoCorrelationValid: boolean;
  isTimeCorrelationValid: boolean;
  isAdditionalityFulfilled: boolean;
  financialSupportReceived: boolean;
  constructor(
    isReductionOver70Percent: boolean,

    isGeoCorrelationValid: boolean,
    isTimeCorrelationValid: boolean,
    isAdditionalityFulfilled: boolean,
    financialSupportReceived: boolean,
  ) {
    super(isReductionOver70Percent);
    this.isGeoCorrelationValid = isGeoCorrelationValid;
    this.isTimeCorrelationValid = isTimeCorrelationValid;
    this.isAdditionalityFulfilled = isAdditionalityFulfilled;
    this.financialSupportReceived = financialSupportReceived;

    this.isRfnboReady =
      this.isReductionOver70Percent &&
      this.isGeoCorrelationValid &&
      this.isTimeCorrelationValid &&
      this.isAdditionalityFulfilled &&
      this.financialSupportReceived;
  }
}
export class GridEnergyRfnboDto extends RfnboBaseDto {
  readonly gridPowerUsed = true;
  // 90% or more renewables in grid mix
  hasHighRenewableShare: boolean;

  // GHG intensity of grid is 18 g CO₂eq/MJ or less
  isGridGHGIntensityLow: boolean;

  // Avoid curtailment / redispatchment
  isCurtailmentAvoided: boolean;
  constructor(
    isReductionOver70Percent: boolean,
    hasHighRenewableShare: boolean,
    isGridGHGIntensityLow: boolean,
    isCurtailmentAvoided: boolean,
  ) {
    super(isReductionOver70Percent);
    this.hasHighRenewableShare = hasHighRenewableShare;
    this.isGridGHGIntensityLow = isGridGHGIntensityLow;
    this.isCurtailmentAvoided = isCurtailmentAvoided;

    this.isRfnboReady =
      this.isReductionOver70Percent && hasHighRenewableShare && isGridGHGIntensityLow && isCurtailmentAvoided;
  }
}
