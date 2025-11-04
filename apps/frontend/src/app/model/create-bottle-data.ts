/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BottlingDto, FGFile } from '@h2-trust/api';

export class CreateBottleData {
  bottle: BottlingDto;
  files: FGFile[];

  constructor(bottle: BottlingDto, files: FGFile[]) {
    this.bottle = bottle;
    this.files = files;
  }
}
