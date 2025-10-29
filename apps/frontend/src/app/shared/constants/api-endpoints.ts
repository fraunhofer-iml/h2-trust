/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BASE_URL } from '../../../environments/environment';

const USERS_ENDPOINT = BASE_URL + '/users/';
const UNITS_ENDPOINT = BASE_URL + '/units/';
const COMPANIES_ENDPOINT = BASE_URL + '/companies/';
const POWER_ACCESS_APPROVALS_ENDPOINT = BASE_URL + '/power-access-approvals/';
const BOTTLING_ENDPOINT = BASE_URL + '/bottlings/';
const PRODUCTION_ENDPOINT = BASE_URL + '/productions/';

export const API = {
  USERS: {
    BASE: USERS_ENDPOINT,
    DETAILS: (id: string) => `${USERS_ENDPOINT}${id}`,
  },
  UNITS: {
    BASE: UNITS_ENDPOINT,
    DETAILS: (id: string) => `${UNITS_ENDPOINT}${id}`,
  },
  COMPANIES: { BASE: COMPANIES_ENDPOINT },
  POWER_ACCESS_APPROVALS: { BASE: POWER_ACCESS_APPROVALS_ENDPOINT },
  BOTTLING: {
    BASE: BOTTLING_ENDPOINT,
    DETAILS: (id: string) => `${BOTTLING_ENDPOINT}${id}`,
    PROOF_OF_ORIGIN: (id: string) => `${BOTTLING_ENDPOINT}${id}/proof-of-origin`,
    PROOF_OF_SUSTAINABILITY: (id: string) => `${BOTTLING_ENDPOINT}${id}/proof-of-sustainability`,
  },
  PRODUCTION: { BASE: PRODUCTION_ENDPOINT, CSV: BOTTLING_ENDPOINT + '/csv-import' },
};
