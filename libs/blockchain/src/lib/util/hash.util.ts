/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { createHash, timingSafeEqual } from 'crypto';
import { Readable } from 'stream';

export class HashUtil {
  static async hashStream(stream: Readable): Promise<string> {
    const hash = createHash('sha256');

    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      hash.on('error', reject);
      hash.on('finish', () => resolve(hash.digest('hex')));
      stream.pipe(hash);
    });
  }

  static async verifyStreamWithHash(stream: Readable, storedHash: string): Promise<boolean> {
    const computedHash = await HashUtil.hashStream(stream);

    if (computedHash.length !== storedHash.length) {
      return false;
    }

    const computedBytes = new Uint8Array(Buffer.from(computedHash, 'hex'));
    const storedBytes = new Uint8Array(Buffer.from(storedHash, 'hex'));
    return timingSafeEqual(computedBytes, storedBytes);
  }
}
