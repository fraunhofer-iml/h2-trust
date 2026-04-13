/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import Stream from 'stream';

export abstract class CentralizedStorageService {
  abstract readonly baseUrl: string;

  abstract uploadFile(fileName: string, file: Buffer, contentType: string): Promise<void>;

  abstract downloadFile(fileName: string): Promise<Stream.Readable>;

  abstract fileExists(fileName: string): Promise<boolean>;
}
