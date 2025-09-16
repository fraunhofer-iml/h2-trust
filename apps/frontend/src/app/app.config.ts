/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { KeycloakBearerInterceptor, KeycloakService } from 'keycloak-angular';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, inject, LOCALE_ID, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { appRoutes } from './app.routes';
import { initializeKeycloak } from './init/keycloak-initializer';
import { AuthService } from './shared/services/auth/auth.service';
import { BottlingService } from './shared/services/bottling/bottling.service';
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
    BottlingService,
    { provide: LOCALE_ID, useValue: 'en-GB' },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
      },
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideClientHydration(withEventReplay()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideTanStackQuery(new QueryClient()),
  ],
};
