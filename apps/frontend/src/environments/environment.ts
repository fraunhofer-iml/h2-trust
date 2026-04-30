/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

declare const window: any;
export const BFF_URL = window.env?.BFF_URL;
export const KEYCLOAK_URL = window.env?.KEYCLOAK_URL;
export const KEYCLOAK_REALM = window.env?.KEYCLOAK_REALM;
export const KEYCLOAK_CLIENT_FRONTEND_ID = window.env?.KEYCLOAK_CLIENT_FRONTEND_ID;
export const environment = {
  production: false,
  KEYCLOAK_URL: KEYCLOAK_URL,
  KEYCLOAK_REALM: KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID: KEYCLOAK_CLIENT_FRONTEND_ID,
};
