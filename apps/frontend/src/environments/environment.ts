/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

declare const window: any;

const DEFAULT_BFF_URL = 'http://localhost:3000';
const DEFAULT_KEYCLOAK_URL = 'http://localhost:8080';
const DEFAULT_KEYCLOAK_REALM = 'h2-trust';
const DEFAULT_KEYCLOAK_CLIENT_FRONTEND_ID = 'h2-trust-frontend';

const env = window?.env ?? {};

function getEnvOrDefault(key: string, fallback: string): string {
  const value = env[key];
  if (!value) {
    console.warn(
      `[env] Missing "${key}", falling back to default "${fallback}". ` +
        'Check env.js / env.template.js and Docker env vars.',
    );
    return fallback;
  }
  return value;
}

export const BFF_URL = getEnvOrDefault('BFF_URL', DEFAULT_BFF_URL);
export const KEYCLOAK_URL = getEnvOrDefault('KEYCLOAK_URL', DEFAULT_KEYCLOAK_URL);
export const KEYCLOAK_REALM = getEnvOrDefault('KEYCLOAK_REALM', DEFAULT_KEYCLOAK_REALM);
export const KEYCLOAK_CLIENT_FRONTEND_ID = getEnvOrDefault(
  'KEYCLOAK_CLIENT_FRONTEND_ID',
  DEFAULT_KEYCLOAK_CLIENT_FRONTEND_ID,
);
export const environment = {
  production: false,
  KEYCLOAK_URL: KEYCLOAK_URL,
  KEYCLOAK_REALM: KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID: KEYCLOAK_CLIENT_FRONTEND_ID,
};
