import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
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
}
