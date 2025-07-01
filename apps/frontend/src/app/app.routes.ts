import { Route } from '@angular/router';
import { AUTHGUARD } from './guards/auth.guard';
import { ROUTES } from './shared/constants/routes';

export const appRoutes: Route[] = [
  {
    path: '',
    canActivate: [AUTHGUARD],
    loadChildren: () => import('./pages/account/routes').then((m) => m.ACCOUNT_ROUTES),
  },
  {
    path: ROUTES.UNITS,
    canActivate: [AUTHGUARD],
    loadChildren: () => import('./pages/units/routes').then((m) => m.HYDROGEN_ASSETS_ROUTES),
  },
  {
    path: ROUTES.PROCESSING,
    canActivate: [AUTHGUARD],
    loadChildren: () => import('./pages/processing/routes').then((m) => m.PROCESSING_ROUTES),
  },
  {
    path: ROUTES.PRODUCTION,
    canActivate: [AUTHGUARD],
    loadChildren: () => import('./pages/production/routes').then((m) => m.PRODUCTION_ROUTES),
  },
];
