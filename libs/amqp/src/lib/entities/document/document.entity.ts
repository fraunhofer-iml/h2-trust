/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocumentDbType } from '@h2-trust/database';

export class DocumentEntity {
  id?: string;
  description: string;
  location: string;

  constructor(id: string, description: string, location: string) {
    this.id = id;
    this.description = description;
    this.location = location;
  }

  static fromDatabase(document: DocumentDbType): DocumentEntity {
    return <DocumentEntity>{
      id: document.id,
      description: document.description,
      location: document.location,
    };
  }
}
