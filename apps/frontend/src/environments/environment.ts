/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

type EnvConfig = {
  BFF_URL?: string;
  KEYCLOAK_URL?: string;
  KEYCLOAK_REALM?: string;
  KEYCLOAK_CLIENT_FRONTEND_ID?: string;
};

declare global {
  interface Window {
    env?: EnvConfig;
  }
}

const env: EnvConfig = window.env ?? {};

function resolveEnv(key: keyof EnvConfig, defaultValue: string): string {
  const value = env[key];

  if (!value) {
    console.warn(
      `[env] "${key}" is missing or empty, using default "${defaultValue}". Check env.js and Docker env vars.`,
    );
    return defaultValue;
  }

  return value;
}

export const environment = {
  BFF_URL: resolveEnv('BFF_URL', 'http://localhost:3000'),
  KEYCLOAK_URL: resolveEnv('KEYCLOAK_URL', 'http://localhost:8080'),
  KEYCLOAK_REALM: resolveEnv('KEYCLOAK_REALM', 'h2-trust'),
  KEYCLOAK_CLIENT_ID: resolveEnv('KEYCLOAK_CLIENT_FRONTEND_ID', 'h2-trust-frontend'),
};
