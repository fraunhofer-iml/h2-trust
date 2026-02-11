/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { randomUUID } from 'crypto';

export class FileUtil {
  static createRandomFileName(originalFileName: string): string {
    const lastDotIndex = originalFileName.lastIndexOf('.');
    const fileExtension =
      lastDotIndex > -1 && lastDotIndex < originalFileName.length - 1
        ? originalFileName.slice(lastDotIndex + 1).toLowerCase()
        : '';

    return fileExtension ? `${randomUUID()}.${fileExtension}` : randomUUID();
  }
}
