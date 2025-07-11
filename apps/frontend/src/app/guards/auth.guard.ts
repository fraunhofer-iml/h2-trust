import { KeycloakService } from 'keycloak-angular';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

export const AUTH_GUARD: CanActivateFn = async () => {
  const keycloakService: KeycloakService = inject(KeycloakService);
  return keycloakService.isLoggedIn();
};
