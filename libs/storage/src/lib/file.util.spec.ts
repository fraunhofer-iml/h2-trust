/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { randomUUID } from 'crypto';
import { FileUtil } from './file.util';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('FileUtil', () => {
  beforeEach(() => {
    (randomUUID as jest.Mock).mockReturnValue('uuid-123');
  });

  it('should use last extension in lower case', () => {
    const result = FileUtil.createRandomFileName('report.PDF');

    expect(result).toBe('uuid-123.pdf');
  });

  it('should use only the last segment for multi-dot names', () => {
    const result = FileUtil.createRandomFileName('archive.tar.gz');

    expect(result).toBe('uuid-123.gz');
  });

  it('should omit extension when there is no dot', () => {
    const result = FileUtil.createRandomFileName('file');

    expect(result).toBe('uuid-123');
  });

  it('should omit extension when the name ends with a dot', () => {
    const result = FileUtil.createRandomFileName('file.');

    expect(result).toBe('uuid-123');
  });

  it('should treat dotfiles as extensions', () => {
    const result = FileUtil.createRandomFileName('.env');

    expect(result).toBe('uuid-123.env');
  });
});
