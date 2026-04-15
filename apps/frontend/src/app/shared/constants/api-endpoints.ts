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
const POWER_PURCHASE_AGREEMENTS_ENDPOINT = BASE_URL + '/power-purchase-agreements/';
const BOTTLING_ENDPOINT = BASE_URL + '/bottlings/';
const PRODUCTION_ENDPOINT = BASE_URL + '/productions/';
const FILE_DOWNLOAD_ENDPOINT = BASE_URL + '/file-download/';

export const API = {
  USERS: {
    BASE: USERS_ENDPOINT,
    DETAILS: (id: string) => `${USERS_ENDPOINT}${id}`,
  },
  UNITS: {
    ACTIVE: (id: string) => `${UNITS_ENDPOINT}${id}/active`,
    POWER_PRODUCTION: {
      BASE: UNITS_ENDPOINT + 'power-production/',
      BY_ID: (id: string) => `${API.UNITS.POWER_PRODUCTION.BASE}${id}`,
    },
    HYDROGEN_PRODUCTION: {
      BASE: UNITS_ENDPOINT + 'hydrogen-production/',
      BY_ID: (id: string) => `${API.UNITS.HYDROGEN_PRODUCTION.BASE}${id}`,
    },
    HYDROGEN_STORAGE: {
      BASE: UNITS_ENDPOINT + 'hydrogen-storage/',
      BY_ID: (id: string) => `${API.UNITS.HYDROGEN_STORAGE.BASE}${id}`,
    },
  },
  COMPANIES: { BASE: COMPANIES_ENDPOINT },
  POWER_PURCHASE_AGREEMENTS: {
    BASE: POWER_PURCHASE_AGREEMENTS_ENDPOINT,
    REQUESTS: POWER_PURCHASE_AGREEMENTS_ENDPOINT + 'requests/',
    REQUESTS_SINGLE: (id: string) => `${API.POWER_PURCHASE_AGREEMENTS.REQUESTS}${id}`,
  },
  BOTTLING: {
    BASE: BOTTLING_ENDPOINT,
    DETAILS: (id: string) => `${BOTTLING_ENDPOINT}${id}`,
  },
  PRODUCTION: {
    BASE: PRODUCTION_ENDPOINT,
    STATISTICS: PRODUCTION_ENDPOINT + 'statistics',
    CSV: PRODUCTION_ENDPOINT + 'csv/',
    CSV_VERIFY: (id: string) => `${API.PRODUCTION.CSV}${id}`,
    CSV_IMPORT: PRODUCTION_ENDPOINT + 'csv/import',
    CSV_SUBMIT: PRODUCTION_ENDPOINT + 'csv/submit',
  },
  FILE_DOWNLOAD: {
    BASE: FILE_DOWNLOAD_ENDPOINT,
  },
};
