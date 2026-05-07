/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@h2-trust/exceptions';

interface ProblemType {
  status: number;
  title: string;
}

export const PROBLEM_TYPES = {
  [ErrorCode.BLOCKCHAIN_NOT_INITIALIZED]: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    title: 'Blockchain Not Initialized',
  },
  [ErrorCode.BLOCKCHAIN_RETRIEVE_FAILED]: { status: HttpStatus.BAD_GATEWAY, title: 'Blockchain Retrieve Failed' },
  [ErrorCode.BLOCKCHAIN_STORE_FAILED]: { status: HttpStatus.BAD_GATEWAY, title: 'Blockchain Store Failed' },
  [ErrorCode.DATABASE_CONSTRAINT]: { status: HttpStatus.BAD_REQUEST, title: 'Database Constraint Violation' },
  [ErrorCode.DATABASE_ERROR]: { status: HttpStatus.INTERNAL_SERVER_ERROR, title: 'Database Error' },
  [ErrorCode.DATABASE_RECORD_CONFLICT]: { status: HttpStatus.CONFLICT, title: 'Record Conflict' },
  [ErrorCode.DATABASE_RECORD_NOT_FOUND]: { status: HttpStatus.NOT_FOUND, title: 'Record Not Found' },
  [ErrorCode.DOMAIN_BUSINESS_RULE_VIOLATION]: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    title: 'Business Rule Violation',
  },
  [ErrorCode.DOMAIN_INCOMPATIBLE_DATA]: { status: HttpStatus.UNPROCESSABLE_ENTITY, title: 'Incompatible Data' },
  [ErrorCode.DOMAIN_RESOURCE_INACTIVE]: { status: HttpStatus.CONFLICT, title: 'Resource Inactive' },
  [ErrorCode.STORAGE_DOWNLOAD_FAILED]: { status: HttpStatus.BAD_GATEWAY, title: 'Storage Download Failed' },
  [ErrorCode.STORAGE_TIMEOUT]: { status: HttpStatus.GATEWAY_TIMEOUT, title: 'Storage Request Timed Out' },
  [ErrorCode.STORAGE_UPLOAD_FAILED]: { status: HttpStatus.BAD_GATEWAY, title: 'Storage Upload Failed' },
  [ErrorCode.INTERNAL_ERROR]: { status: HttpStatus.INTERNAL_SERVER_ERROR, title: 'Internal Server Error' },
  [ErrorCode.VALIDATION_ERROR]: { status: HttpStatus.BAD_REQUEST, title: 'Validation Error' },
} as const satisfies Record<ErrorCode, ProblemType>;
