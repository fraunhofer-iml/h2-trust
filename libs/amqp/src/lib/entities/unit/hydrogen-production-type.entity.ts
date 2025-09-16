/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionTypeDbType } from '@h2-trust/database';

export class HydrogenProductionTypeEntity {
  id: string;
  method: string;
  technology: string;

  constructor(id: string, method: string, technology: string) {
    this.id = id;
    this.method = method;
    this.technology = technology;
  }

  static fromDatabase(hydrogenProductionTypeDbType: HydrogenProductionTypeDbType): HydrogenProductionTypeEntity {
    return <HydrogenProductionTypeEntity>{
      id: hydrogenProductionTypeDbType.id,
      method: hydrogenProductionTypeDbType.method,
      technology: hydrogenProductionTypeDbType.technology,
    };
  }
}
