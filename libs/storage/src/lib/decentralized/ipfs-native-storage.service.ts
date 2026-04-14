/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';
import { Logger } from '@nestjs/common';
import { ContentType } from '../content-types';
import { DecentralizedStorageService } from './decentralized-storage.service';

export class IpfsNativeStorageService extends DecentralizedStorageService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly endpointUrl: string,
    public readonly explorerUrl: string,
  ) {
    super();

    this.logger.debug('🔗 IPFS native node is used for decentralized file storage.');
    this.logger.debug(`🌐 Endpoint URL: ${this.endpointUrl}`);
    this.logger.debug(`🧭 Explorer URL: ${this.explorerUrl}`);
  }

  async uploadFile(fileName: string, file: Buffer, contentType: ContentType): Promise<string> {
    const formData = new FormData();
    formData.append('file', new Blob([new Uint8Array(file)], { type: contentType }), fileName);

    const addUrl = this.buildUrlWithPath('add?pin=true');
    const addResponse = await fetch(addUrl, {
      method: 'POST',
      body: formData,
    });

    if (!addResponse.ok) {
      throw new Error(`IPFS add failed: ${addResponse.status} ${await addResponse.text()}`);
    }

    const { Hash: cid } = (await addResponse.json()) as { Hash: string };
    this.logger.debug(`Added file ${fileName} to IPFS with CID: ${cid}`);

    const cpUrl = this.buildUrlWithPath(`files/cp?arg=/ipfs/${cid}&arg=/${fileName}`);
    const cpResponse = await fetch(cpUrl, {
      method: 'POST',
    });

    if (!cpResponse.ok) {
      const text = await cpResponse.text();
      if (!text.includes('already has entry')) {
        throw new Error(`IPFS files/cp failed: ${cpResponse.status} ${text}`);
      }
    }

    return cid;
  }

  async downloadFile(fileName: string): Promise<Readable> {
    const url = this.buildUrlWithPath(`files/read?arg=/${fileName}`);
    const response = await fetch(url, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`IPFS files/read failed: ${response.status} ${await response.text()}`);
    }

    if (!response.body) {
      throw new Error(`IPFS files/read failed: response body is empty for file: ${fileName}`);
    }

    return Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
  }

  private buildUrlWithPath(path: string): string {
    return `${this.endpointUrl}/api/v0/${path}`;
  }
}
