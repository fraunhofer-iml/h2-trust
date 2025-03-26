import { Route } from '@angular/router';
import { AccountOverviewComponent } from './pages/account-overview/account-overview.component';
import { AUTHGUARD } from './guards/auth.guard';
import { HydrogenAssetsComponent } from './pages/hydrogen-assets/hydrogen-assets.component';
import { ROUTES } from './shared/constants/routes';

export const appRoutes: Route[] = [
  { path: '', component: AccountOverviewComponent, canActivate: [AUTHGUARD] },
  { path: ROUTES.HYDROGEN_UNITS, component: HydrogenAssetsComponent, canActivate: [AUTHGUARD] },
];
