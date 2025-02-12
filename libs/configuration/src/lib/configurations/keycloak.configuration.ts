/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerAs } from '@nestjs/config';

export const KEYCLOAK_CONFIGURATION_IDENTIFIER = 'keycloak-configuration';

export interface KeycloakConfiguration {
  url: string;
  realm: string;
  tokenUri: string;
  clientId: string;
  clientSecret: string;
  grantType: string;
  username: string;
  password: string;
}

export default registerAs(KEYCLOAK_CONFIGURATION_IDENTIFIER, () => ({
  url: process.env['KEYCLOAK_URL'] || 'https://kc.public.apps.blockchain-europe.iml.fraunhofer.de',
  realm: process.env['KEYCLOAK_REALM'] || 'h2-trust',
  tokenUri: process.env['KEYCLOAK_TOKEN_URI'] || 'protocol/openid-connect/token',
  clientId: process.env['KEYCLOAK_CLIENT_ID'] || 'h2-trust-bff',
  clientSecret: process.env['KEYCLOAK_SECRET'] || '',
  username: process.env['KEYCLOAK_USER'] || '',
  password: process.env['KEYCLOAK_PASSWORD'] || '',
  grantType: process.env['KEYCLOAK_GRANT_TYPE'] || 'client_credentials',
}));
