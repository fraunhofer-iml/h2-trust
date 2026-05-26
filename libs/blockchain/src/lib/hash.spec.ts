/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';
import { hashStream, verifyStreamWithStoredHash } from './hash';

describe('hash util functions', () => {
  describe('hash', () => {
    it('should return the correct SHA-256 hex digest when hashing known input', async () => {
      // arrange
      const givenStream = Readable.from(Buffer.from('hello world'));
      const expectedHash = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9';

      // act
      const actualHash = await hashStream(givenStream);

      // assert
      expect(actualHash).toBe(expectedHash);
    });

    it('should return the correct hash when hashing an empty stream', async () => {
      // arrange
      const givenStream = Readable.from(Buffer.alloc(0));
      const expectedHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

      // act
      const actualHash = await hashStream(givenStream);

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
      const expectedErrorMessage = 'stream error';

      // act & assert
      await expect(hashStream(givenStream)).rejects.toThrow(expectedErrorMessage);
    });
  });

  describe('verify', () => {
    it('should return true when the stored hash matches the stream content', async () => {
      // arrange
      const givenStream = Readable.from(Buffer.from('hello world'));
      const givenStoredHash = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9';

      // act
      const actualResult = await verifyStreamWithStoredHash(givenStream, givenStoredHash);

      // assert
      expect(actualResult).toBe(true);
    });

    it('should return false when the stored hash does not match the stream content', async () => {
      // arrange
      const givenStream = Readable.from(Buffer.from('hello world'));
      const givenStoredHash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

      // act
      const actualResult = await verifyStreamWithStoredHash(givenStream, givenStoredHash);

      // assert
      expect(actualResult).toBe(false);
    });
  });
});
