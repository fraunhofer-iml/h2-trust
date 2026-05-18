/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

// Based on RFC 9457: https://datatracker.ietf.org/doc/html/rfc9457
export interface ProblemDetail {
  type: string;
  status: number;
  title: string;
  detail: string;
  instance: string;
  timestamp: string;
  validationErrors?: string[];
}
