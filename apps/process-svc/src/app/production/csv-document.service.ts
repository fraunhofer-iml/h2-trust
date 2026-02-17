/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { CsvDocumentEntity, ReadByIdPayload } from '@h2-trust/amqp';
import { CsvImportRepository } from '@h2-trust/database';

@Injectable()
export class CsvDocumentService {
  constructor(private readonly csvImportRepository: CsvImportRepository) {}

  async findByCompany(payload: ReadByIdPayload): Promise<CsvDocumentEntity[]> {
    return this.csvImportRepository.findAllCsvDocumentsByCompanyId(payload.id);
  }
}
