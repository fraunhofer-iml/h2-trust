/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerAccessApprovalConnectionDto } from './power-access-approval-connectopn.dto';

export class UnitOwnerDto {
  id: string;
  name: string;
  hydrogenApprovals: PowerAccessApprovalConnectionDto[];

  constructor(id: string, name: string, hydrogenApprovals: PowerAccessApprovalConnectionDto[]) {
    this.id = id;
    this.name = name;
    this.hydrogenApprovals = hydrogenApprovals;
  }
}
