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
    POWER_PRODUCTION: {
      BASE: UNITS_ENDPOINT + 'power-production/',
      DETAILS: (id: string) => `${API.UNITS.POWER_PRODUCTION.BASE}${id}`,
    },
    HYDROGEN_PRODUCTION: {
      BASE: UNITS_ENDPOINT + 'hydrogen-production/',
      DETAILS: (id: string) => `${API.UNITS.HYDROGEN_PRODUCTION.BASE}${id}`,
    },
    HYDROGEN_STORAGE: {
      BASE: UNITS_ENDPOINT + 'hydrogen-storage/',
      DETAILS: (id: string) => `${API.UNITS.HYDROGEN_STORAGE.BASE}${id}`,
    },
  },
  COMPANIES: { BASE: COMPANIES_ENDPOINT },
  POWER_ACCESS_APPROVALS: { BASE: POWER_ACCESS_APPROVALS_ENDPOINT },
  BOTTLING: {
    BASE: BOTTLING_ENDPOINT,
    DETAILS: (id: string) => `${BOTTLING_ENDPOINT}${id}`,
  },
  PRODUCTION: {
    BASE: PRODUCTION_ENDPOINT,
    CSV: PRODUCTION_ENDPOINT + 'csv/import',
    CSV_SUBMIT: PRODUCTION_ENDPOINT + 'csv/submit',
  },
};
