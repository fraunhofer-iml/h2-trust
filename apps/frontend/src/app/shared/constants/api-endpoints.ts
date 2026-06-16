/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { environment } from '../../../environments/environment';

const USERS_ENDPOINT = environment.BFF_URL + '/users/';
const UNITS_ENDPOINT = environment.BFF_URL + '/units/';
const COMPANIES_ENDPOINT = environment.BFF_URL + '/companies/';
const POWER_PURCHASE_AGREEMENTS_ENDPOINT = environment.BFF_URL + '/power-purchase-agreements/';
const PROCESS_STEPS_ENDPOINT = environment.BFF_URL + '/process-steps/';
const PRODUCTION_ENDPOINT = environment.BFF_URL + '/productions/';
const FILE_DOWNLOAD_ENDPOINT = environment.BFF_URL + '/file-download/';

export const API = {
  USERS: {
    BASE: USERS_ENDPOINT,
    DETAILS: (id: string) => `${USERS_ENDPOINT}${id}`,
  },
  UNITS: {
    BASE: UNITS_ENDPOINT,
    BY_ID: (id: string) => `${UNITS_ENDPOINT}${id}`,
    COMPONENT_OVERVIEWS: () => `${PROCESS_STEPS_ENDPOINT}components`,
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
    HYDROGEN_BOTTLING: {
      BASE: UNITS_ENDPOINT + 'hydrogen-bottling/',
      BY_ID: (id: string) => `${API.UNITS.HYDROGEN_BOTTLING.BASE}${id}`,
    },
    HYDROGEN_TRANSPORT: {
      BASE: UNITS_ENDPOINT + 'hydrogen-transport/',
      BY_ID: (id: string) => `${API.UNITS.HYDROGEN_TRANSPORT.BASE}${id}`,
    },
    HYDROGEN_END_USE: {
      BASE: UNITS_ENDPOINT + 'hydrogen-end-use/',
      BY_ID: (id: string) => `${API.UNITS.HYDROGEN_END_USE.BASE}${id}`,
    },
    HYDROGEN_COMPRESSOR: {
      BASE: UNITS_ENDPOINT + 'hydrogen-compressor/',
      BY_ID: (id: string) => `${API.UNITS.HYDROGEN_COMPRESSOR.BASE}${id}`,
    },
  },
  COMPANIES: { BASE: COMPANIES_ENDPOINT },
  POWER_PURCHASE_AGREEMENTS: {
    BASE: POWER_PURCHASE_AGREEMENTS_ENDPOINT,
    REQUESTS: POWER_PURCHASE_AGREEMENTS_ENDPOINT + 'requests/',
    REQUESTS_SINGLE: (id: string) => `${API.POWER_PURCHASE_AGREEMENTS.REQUESTS}${id}`,
  },
  PROCESS_STEPS: {
    BASE: PROCESS_STEPS_ENDPOINT,
    DETAILS: (id: string) => `${PROCESS_STEPS_ENDPOINT}${id}`,
  },
  PRODUCTION: {
    BASE: PRODUCTION_ENDPOINT,
    STATISTICS: PRODUCTION_ENDPOINT + 'statistics',
    PENDING: PRODUCTION_ENDPOINT + 'pending/',
    CSV: PRODUCTION_ENDPOINT + 'pending/csv/',
    CSV_VERIFY: (id: string) => `${API.PRODUCTION.CSV}${id}/verify`,
  },
  FILE_DOWNLOAD: {
    BASE: FILE_DOWNLOAD_ENDPOINT,
  },
};
