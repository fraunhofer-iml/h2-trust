/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import Stream from 'stream';
import { ContentType } from '../content-types';

export abstract class DecentralizedStorageService {
  abstract readonly explorerUrl: string;

  abstract uploadFile(fileName: string, file: Buffer, contentType: ContentType): Promise<string | undefined>;

  abstract downloadFile(fileName: string): Promise<Stream.Readable>;
}
