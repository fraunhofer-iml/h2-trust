/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import {
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
  provideKeycloak,
} from 'keycloak-angular';
import { appRoutes } from './app.routes';
import { apiCondition, keycloakOptions } from './init/keycloak-config';
import { AuthService } from './shared/services/auth/auth.service';
import { BottlingService } from './shared/services/bottling/bottling.service';
import { CompaniesService } from './shared/services/companies/companies.service';
import { PowerPurchaseAgreementService } from './shared/services/power-purchase-agreement/power-purchase-agreement.service';
import { ProductionService } from './shared/services/production/production.service';
import { UnitsService } from './shared/services/units/units.service';
import { UsersService } from './shared/services/users/users.service';
import { VerificationResultStore } from './shared/store/verification-result.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak(keycloakOptions),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [apiCondition],
    },
    AuthService,
    UsersService,
    UnitsService,
    BottlingService,
    VerificationResultStore,
    CompaniesService,
    PowerPurchaseAgreementService,
    ProductionService,
    { provide: LOCALE_ID, useValue: 'en-GB' },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
      },
    },
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    provideClientHydration(withEventReplay()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideTanStackQuery(new QueryClient()),
  ],
};
