/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';
import { HashUtil } from './hash.util';

describe('HashUtil', () => {
  describe('hash', () => {
    it('should return correct SHA-256 hex digest for known input', async () => {
      // arrange
      const givenStream = Readable.from(Buffer.from('hello world'));
      const expectedHash = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9';

      // act
      const actualHash = await HashUtil.hashStream(givenStream);

      // assert
      expect(actualHash).toBe(expectedHash);
    });

    it('should return correct hash for empty stream', async () => {
      // arrange
      const givenStream = Readable.from(Buffer.alloc(0));
      const expectedHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

      // act
      const actualHash = await HashUtil.hashStream(givenStream);

      // assert
      expect(actualHash).toBe(expectedHash);
    });

    it('should reject when stream emits an error', async () => {
      // arrange
      const givenStream = new Readable({
        read() {
          this.destroy(new Error('stream error'));
        },
      });

      // act & assert
      await expect(HashUtil.hashStream(givenStream))
        .rejects.toThrow('stream error');
    });
  });

  describe('verify', () => {
    it('should return true when hash matches', async () => {
      const givenStream = Readable.from(Buffer.from('hello world'));
      const givenStoredHash = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9';

      const actualResult = await HashUtil.verifyStreamWithHash(givenStream, givenStoredHash);

      expect(actualResult).toBe(true);
    });

    it('should return false when hash does not match', async () => {
      const givenStream = Readable.from(Buffer.from('hello world'));
      const givenStoredHash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

      const actualResult = await HashUtil.verifyStreamWithHash(givenStream, givenStoredHash);

      expect(actualResult).toBe(false);
    });
  });
});
