import { KeycloakBearerInterceptor, KeycloakService } from 'keycloak-angular';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { initializeKeycloak } from './init/keycloak-initializer';
import { AuthService } from './shared/services/auth/auth.service';
import { UnitsService } from './shared/services/units/units.service';
import { UsersService } from './shared/services/users/users.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideAppInitializer(() => {
      const initializerFn = initializeKeycloak(inject(KeycloakService));
      return initializerFn();
    }),
    KeycloakBearerInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakBearerInterceptor,
      multi: true,
      deps: [KeycloakService],
    },
    KeycloakService,
    AuthService,
    UsersService,
    UnitsService,
    provideHttpClient(withInterceptorsFromDi()),
    provideClientHydration(withEventReplay()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
  ],
};
