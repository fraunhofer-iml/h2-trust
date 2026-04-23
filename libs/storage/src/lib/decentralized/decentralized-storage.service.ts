/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';
import { ContentType } from '../content-types';

export abstract class DecentralizedStorageService {
  abstract readonly endpointUrl: string | null;

  abstract readonly explorerUrl: string | null;

  abstract uploadFile(fileName: string, file: Buffer, contentType: ContentType): Promise<string>;

  abstract downloadFile(fileName: string): Promise<Readable>;
}
