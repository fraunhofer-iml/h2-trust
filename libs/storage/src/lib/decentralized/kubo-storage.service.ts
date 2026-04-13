/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';
import { Logger } from '@nestjs/common';
import { DecentralizedStorageService } from './decentralized-storage.service';
import { ContentType } from '../content-types';

export class KuboStorageService extends DecentralizedStorageService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly endpointUrl: string,
    public readonly explorerUrl: string,
  ) {
    super();

    this.logger.debug('🔗 Kubo is used for decentralized file storage.');
    this.logger.debug(`🌐 Endpoint URL: ${this.endpointUrl}`);
    this.logger.debug(`🧭 Explorer URL: ${this.explorerUrl}`);
  }

  async uploadFile(fileName: string, file: Buffer, contentType: ContentType): Promise<string> {
    const formData = new FormData();
    formData.append('file', new Blob([new Uint8Array(file)], { type: contentType }), fileName);

    const addResponse = await fetch(`${this.endpointUrl}/api/v0/add?pin=true`, {
      method: 'POST',
      body: formData,
    });

    if (!addResponse.ok) {
      throw new Error(`Kubo add failed: ${addResponse.status} ${await addResponse.text()}`);
    }

    const { Hash: cid } = (await addResponse.json()) as { Hash: string };
    this.logger.debug(`Added file ${fileName} to Kubo with CID: ${cid}`);

    const cpResponse = await fetch(
      `${this.endpointUrl}/api/v0/files/cp?arg=/ipfs/${cid}&arg=/${fileName}`,
      { method: 'POST' },
    );

    if (!cpResponse.ok) {
      const text = await cpResponse.text();
      if (!text.includes('already has entry')) {
        throw new Error(`Kubo files/cp failed: ${cpResponse.status} ${text}`);
      }
    }

    return cid;
  }

  async downloadFile(fileName: string): Promise<Readable> {
    const response = await fetch(`${this.endpointUrl}/api/v0/files/read?arg=/${fileName}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Kubo files/read failed: ${response.status} ${await response.text()}`);
    }

    if (!response.body) {
      throw new Error(`Kubo files/read failed: response body is empty for file: ${fileName}`);
    }

    return Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
  }
}
