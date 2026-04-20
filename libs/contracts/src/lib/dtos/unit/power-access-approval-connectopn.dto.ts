/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export class PowerAccessApprovalConnectionDto {
  powerAccessApprovalStatus: string;
  powerProducerId: string;

  constructor(powerAccessApprovalStatus: string, powerProducerId: string) {
    this.powerAccessApprovalStatus = powerAccessApprovalStatus;
    this.powerProducerId = powerProducerId;
  }
}
