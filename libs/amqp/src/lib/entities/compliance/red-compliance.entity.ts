/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export class RedComplianceEntity {
  isRedCompliant: boolean;
  isGeoCorrelationValid: boolean;
  isTimeCorrelationValid: boolean;
  isAdditionalityFulfilled: boolean;
  financialSupportReceived: boolean;

  constructor(
    isGeoCorrelationValid: boolean,
    isTimeCorrelationValid: boolean,
    isAdditionalityFulfilled: boolean,
    financialSupportReceived: boolean,
  ) {
    this.isGeoCorrelationValid = isGeoCorrelationValid;
    this.isTimeCorrelationValid = isTimeCorrelationValid;
    this.isAdditionalityFulfilled = isAdditionalityFulfilled;
    this.financialSupportReceived = financialSupportReceived;

    this.isRedCompliant =
      this.isGeoCorrelationValid &&
      this.isTimeCorrelationValid &&
      this.isAdditionalityFulfilled &&
      this.financialSupportReceived;
  }
}
