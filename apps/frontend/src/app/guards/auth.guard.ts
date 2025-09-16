/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { KeycloakService } from 'keycloak-angular';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

export const AUTH_GUARD: CanActivateFn = async () => {
  const keycloakService: KeycloakService = inject(KeycloakService);
  const isLoggedIn = keycloakService.isLoggedIn();
  if (!isLoggedIn) keycloakService.login();
  return isLoggedIn;
};
