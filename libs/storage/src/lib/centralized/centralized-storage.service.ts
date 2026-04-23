/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';
import { ContentType } from '../content-types';

export abstract class CentralizedStorageService {
  abstract readonly endpointUrl: string;

  abstract uploadFile(fileName: string, file: Buffer, contentType: ContentType): Promise<void>;

  abstract downloadFile(fileName: string): Promise<Readable>;

  abstract fileExists(fileName: string): Promise<boolean>;
}
