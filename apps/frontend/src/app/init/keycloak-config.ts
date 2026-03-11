/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInterceptorCondition, IncludeBearerTokenCondition, ProvideKeycloakOptions } from 'keycloak-angular';
import { BASE_URL, environment } from '../../environments/environment';

export const keycloakOptions: ProvideKeycloakOptions = {
  config: {
    url: environment.KEYCLOAK_URL,
    realm: environment.KEYCLOAK_REALM,
    clientId: environment.KEYCLOAK_CLIENT_ID,
  },
  initOptions: {
    onLoad: 'check-sso',
    silentCheckSsoFallback: true,
    flow: 'standard',
    silentCheckSsoRedirectUri: window.location.origin + '/assets/keycloak/silent-check-sso.html',
  },
};

export const apiCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: new RegExp(`^${BASE_URL}(\\/.*)?$`, 'i'),
});
