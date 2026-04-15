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

    this.logger.debug('🔗 Feature verification is enabled: IPFS native node is used for decentralized file storage.');
    this.logger.debug(`🌐 Endpoint URL: ${this.endpointUrl}`);
    this.logger.debug(`🧭 Explorer URL: ${this.explorerUrl}`);
  }

  async uploadFile(fileName: string, file: Buffer, contentType: ContentType): Promise<string> {
    // Convert the file buffer to a Uint8Array for IPFS upload
    const fileView = new Uint8Array(file.buffer as ArrayBuffer, file.byteOffset, file.byteLength);
    const formData = new FormData();
    formData.append('file', new Blob([fileView], { type: contentType }), fileName);

    // Add the file to IPFS and get the CID (Content Identifier)
    const addUrl = this.buildUrlWithPath('add?pin=true');
    const addResponse = await this.fetchWithTimeout(addUrl, {
      method: 'POST',
      body: formData,
    });

    if (!addResponse.ok) {
      throw new Error(`IPFS add failed: ${addResponse.status} ${await addResponse.text()}`);
    }

    const { Hash: cid } = (await addResponse.json()) as { Hash: string };
    this.logger.debug(`Added file ${fileName} to IPFS with CID: ${cid}`);

    // Copy the file to the MFS (Mutable File System) path
    const cpUrl = this.buildUrlWithPath(`files/cp?arg=/ipfs/${cid}&arg=/${fileName}`);
    const cpResponse = await this.fetchWithTimeout(cpUrl, {
      method: 'POST',
    });

    if (!cpResponse.ok) {
      const text = await cpResponse.text();
      this.logger.warn(`IPFS files/cp failed: ${cpResponse.status}, file with CID ${cid} may already exist. Response: ${text}`);
    }

    return cid;
  }

  async downloadFile(fileName: string): Promise<Readable> {
    const url = this.buildUrlWithPath(`files/read?arg=/${fileName}`);
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`IPFS files/read failed: ${response.status} ${await response.text()}`);
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
        throw new Error(`IPFS request timed out after ${timeoutMs}ms: ${url}`);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}
