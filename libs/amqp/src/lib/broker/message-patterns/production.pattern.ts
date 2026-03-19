/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ProductionMessagePatterns {
  CREATE = 'production.create',
  STAGE = 'production.stage',
  FINALIZE = 'production.finalize',
  READ_CSV_DOCUMENTS_BY_COMPANY = 'production.read-csv-documents-by-company',
  VERIFY_CSV_DOCUMENT_INTEGRITY = 'production.verify-csv-document-integrity',
  READ_PAGINATED_HYDROGEN_PRODUCTION_DATA_BY_PREDECESSOR_TYPES_AND_OWNER = 'production.read-paginated-hydrogen-production-data-by-predecessor-types-and-owner',
}
