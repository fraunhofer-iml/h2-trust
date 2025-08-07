import { KeycloakService } from 'keycloak-angular';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

export const AUTH_GUARD: CanActivateFn = async () => {
  const keycloakService: KeycloakService = inject(KeycloakService);
  const isLoggedIn = keycloakService.isLoggedIn();
  if (!isLoggedIn) keycloakService.login();
  return isLoggedIn;
};
