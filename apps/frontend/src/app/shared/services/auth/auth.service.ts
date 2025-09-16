/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {
  constructor(private readonly keycloak: KeycloakService) {}

  async getUserId(): Promise<string> {
    const profile: KeycloakProfile = await this.keycloak.loadUserProfile();
    return profile.id ?? '';
  }

  async getCurrentUserDetails(): Promise<{
    firstName: string;
    lastName: string;
    email: string;
  }> {
    const profile: KeycloakProfile = await this.keycloak.loadUserProfile();
    return {
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      email: profile.email ?? '',
    };
  }

  logout() {
    this.keycloak.logout();
  }

  isAuthenticated() {
    return this.keycloak.isLoggedIn();
  }

  logIn() {
    this.keycloak.login();
  }
}
