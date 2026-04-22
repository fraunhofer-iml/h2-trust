/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsArray, IsNotEmpty } from 'class-validator';

export class DownloadFilesDto {
  @IsNotEmpty()
  @IsArray()
  ids: string[];

  constructor(ids: string[]) {
    this.ids = ids;
  }
}
