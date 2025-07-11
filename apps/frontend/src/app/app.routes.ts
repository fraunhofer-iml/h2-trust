import { Route } from '@angular/router';
import { AUTH_GUARD } from './guards/auth.guard';
import { ROUTES } from './shared/constants/routes';

export const appRoutes: Route[] = [
  {
    path: '',
    canActivate: [AUTH_GUARD],
    loadChildren: () => import('./pages/account/routes').then((m) => m.ACCOUNT_ROUTES),
  },
  {
    path: ROUTES.UNITS,
    canActivate: [AUTH_GUARD],
    loadChildren: () => import('./pages/units/routes').then((m) => m.HYDROGEN_ASSETS_ROUTES),
  },
  {
    path: ROUTES.BOTTLING,
    canActivate: [AUTH_GUARD],
    loadChildren: () => import('./pages/bottling/routes').then((m) => m.BOTTLING_ROUTES),
  },
  {
    path: ROUTES.PRODUCTION,
    canActivate: [AUTH_GUARD],
    loadChildren: () => import('./pages/production/routes').then((m) => m.PRODUCTION_ROUTES),
  },
];
