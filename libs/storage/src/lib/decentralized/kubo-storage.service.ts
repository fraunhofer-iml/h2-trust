/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';
import { Logger } from '@nestjs/common';
import { ConfigurationService } from '@h2-trust/configuration';
import { DecentralizedStorageService } from './decentralized-storage.service';

export class KuboStorageService extends DecentralizedStorageService {
  readonly explorerUrl: string;

  private readonly apiUrl: string;
  private readonly logger = new Logger(this.constructor.name);

  constructor(configurationService: ConfigurationService) {
    super();

    const config = configurationService.getGlobalConfiguration().decentralizedStorage;

    if (config.provider !== 'kubo') {
      throw new Error('KuboStorageService requires provider "kubo"');
    }

    this.apiUrl = config.apiUrl;
    this.explorerUrl = config.gatewayUrl;
  }

  async uploadCsvFile(fileName: string, file: Buffer): Promise<string | undefined> {
    const formData = new FormData();
    formData.append('file', new Blob([new Uint8Array(file)], { type: 'text/csv' }), fileName);

    const addResponse = await fetch(`${this.apiUrl}/api/v0/add?pin=true`, {
      method: 'POST',
      body: formData,
    });

    if (!addResponse.ok) {
      throw new Error(`Kubo add failed: ${addResponse.status} ${await addResponse.text()}`);
    }

    const { Hash: cid } = (await addResponse.json()) as { Hash: string };
    this.logger.debug(`Added file ${fileName} to IPFS with CID: ${cid}`);

    const cpResponse = await fetch(
      `${this.apiUrl}/api/v0/files/cp?arg=/ipfs/${cid}&arg=/${fileName}`,
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
    const response = await fetch(`${this.apiUrl}/api/v0/files/read?arg=/${fileName}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Kubo files/read failed: ${response.status} ${await response.text()}`);
    }

    return Readable.fromWeb(response.body as any);
  }
}
