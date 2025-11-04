/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export const BASE_URL = 'http://localhost:3000';

export const environment = {
  production: false,
  KEYCLOAK_CLIENT_ID: 'h2-trust-frontend',
  KEYCLOAK_SECRET: '',
  KEYCLOAK_URL: 'https://kc.public.apps.blockchain-europe.iml.fraunhofer.de',
  KEYCLOAK_REALM: 'h2-trust',
  KEYCLOAK_GRANT_TYPE: 'client_credentials',

  ACCOUNTING_PERIOD_IN_SECONDS: 900,
};
