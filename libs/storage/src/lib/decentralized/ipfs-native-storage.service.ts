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
  private static readonly API_BASE = '/api/v0';
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly endpointUrl: string,
    public readonly explorerUrl: string,
  ) {
    super();

    this.logger.debug('🔗 IPFS native initialized.');
    this.logger.debug(`🌐 Endpoint: ${this.endpointUrl}`);
    this.logger.debug(`🧭 Explorer: ${this.explorerUrl}`);
  }

  async uploadFile(fileName: string, file: Buffer, contentType: ContentType): Promise<string> {
    const fileView = new Uint8Array(file.buffer as ArrayBuffer, file.byteOffset, file.byteLength);
    const formData = new FormData();
    formData.append('file', new Blob([fileView], { type: contentType }), fileName);

    const cid = await this.addToIpfs(fileName, formData);
    await this.copyToMfs(fileName, cid);
    return cid;
  }

  private async addToIpfs(fileName: string, formData: FormData): Promise<string> {
    const response = await this.fetchWithTimeout(this.buildUrlWithPath('add?pin=true'), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed (${response.status}): ${await response.text()}`);
    }

    const { Hash: cid } = (await response.json()) as { Hash: string };
    this.logger.debug(`Uploaded '${fileName}', CID: ${cid}`);
    
    return cid;
  }

  private async copyToMfs(fileName: string, cid: string): Promise<void> {
    // Copy the file to the MFS (Mutable File System) path for name-based lookup in downloadFile.
    const response = await this.fetchWithTimeout(
      this.buildUrlWithPath(`files/cp?arg=/ipfs/${cid}&arg=/${fileName}`),
      { method: 'POST' },
    );

    if (!response.ok) {
      const text = await response.text();
      this.logger.warn(`MFS copy failed (${response.status}) for '${fileName}', file may already exist. Response: ${text}`);
    }
  }

  async downloadFile(fileName: string): Promise<Readable> {
    const url = this.buildUrlWithPath(`files/read?arg=/${fileName}`);
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Download failed (${response.status}) for '${fileName}': ${await response.text()}`);
    }

    return Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
  }

  private buildUrlWithPath(path: string): string {
    return `${this.endpointUrl}${IpfsNativeStorageService.API_BASE}/${path}`;
  }

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutMs = 15_000; // 15 seconds
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs} ms: ${url}`);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}
