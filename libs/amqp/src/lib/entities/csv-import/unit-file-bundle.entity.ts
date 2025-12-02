/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import 'multer';

export class UnitFileBundle {
  unitId: string;
  file: Express.Multer.File;

  constructor(unitId: string, file: Express.Multer.File) {
    this.unitId = unitId;
    this.file = file;
  }
}
