/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitFileReference } from './unit-file-reference.entity';

export class ImportedFileBundles {
  powerProduction: UnitFileReference[];
  hydrogenProduction: UnitFileReference[];

  constructor(powerProduction: UnitFileReference[], hydrogenProduction: UnitFileReference[]) {
    this.powerProduction = powerProduction;
    this.hydrogenProduction = hydrogenProduction;
  }
}
