import Keycloak from 'keycloak-js';
import { Injectable } from '@angular/core';
import { userId } from '../../constants/hardcoded-values';

@Injectable({
  providedIn: 'root',
})

//Mostly Mocked since requested users havent been generated jet and mockdata ist synced either
export class AuthService {
  private userId: string;
  constructor(private readonly keycloak: Keycloak) {
    this.userId = ' ';
    this.fetchUserId();
  }

  async fetchUserId() {
    if (this.keycloak?.authenticated) {
      const profile = await this.keycloak.loadUserProfile();

      if (profile.username) {
        this.userId = profile.username;
      } else {
        throw new Error('UserProfile has no Id');
      }
    }
  }

  getUserId() {
    return userId;
  }

  async logout() {
    await this.keycloak.logout({ redirectUri: '' });
  }
}
