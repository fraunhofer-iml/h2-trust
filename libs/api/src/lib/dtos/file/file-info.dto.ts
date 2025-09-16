/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export class FileInfoDto {
  description: string;
  url: string;

  constructor(description: string, url: string) {
    this.description = description;
    this.url = url;
  }
}
