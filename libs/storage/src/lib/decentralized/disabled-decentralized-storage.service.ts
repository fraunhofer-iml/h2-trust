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

export class DisabledDecentralizedStorageService extends DecentralizedStorageService {
    private readonly logger = new Logger(this.constructor.name);

    readonly explorerUrl: string | null = null;

    constructor() {
        super();
        this.logger.debug('⛓️‍💥 Decentralized storage disabled.');
    }

    async uploadFile(_fileName: string, _file: Buffer, _contentType: ContentType): Promise<string> {
        throw new Error('Upload failed: decentralized storage service not initialized.');
    }

    async downloadFile(_fileName: string): Promise<Readable> {
        throw new Error('Download failed: decentralized storage service not initialized.');
    }
}
