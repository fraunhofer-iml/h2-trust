import { KeycloakService } from 'keycloak-angular';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

export const AUTHGUARD: CanActivateFn = async (route) => {
  const keycloakService: KeycloakService = inject(KeycloakService);
  const isLoggedIn = keycloakService.isLoggedIn();
  if (!isLoggedIn) return false;
  const ownCompanyParam = route.queryParamMap.get('own');
  if (ownCompanyParam === 'true') return true;
  return true;
};
