/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitFileBundle } from './unit-file-bundle.entity';

export class ImportedFileBundles {
  powerProduction: UnitFileBundle[];
  hydrogenProduction: UnitFileBundle[];

  constructor(powerProduction: UnitFileBundle[], hydrogenProduction: UnitFileBundle[]) {
    this.powerProduction = powerProduction;
    this.hydrogenProduction = hydrogenProduction;
  }
}
