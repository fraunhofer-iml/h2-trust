import { Route } from '@angular/router';
import { AUTHGUARD } from './guards/auth.guard';
import { AccountOverviewComponent } from './pages/account-overview/account-overview.component';
import { HydrogenAssetsComponent } from './pages/hydrogen-assets/hydrogen-assets.component';
import { ProcessingOverviewComponent } from './pages/processing-overview/processing-overview.component';
import { ProductionViewComponent } from './pages/production-view/production-view.component';
import { ROUTES } from './shared/constants/routes';

export const appRoutes: Route[] = [
  { path: '', component: AccountOverviewComponent, canActivate: [AUTHGUARD] },
  { path: ROUTES.HYDROGEN_UNITS, component: HydrogenAssetsComponent, canActivate: [AUTHGUARD] },
  { path: ROUTES.PROCESSING, component: ProcessingOverviewComponent, canActivate: [AUTHGUARD] },
  { path: ROUTES.PRODUCTION, component: ProductionViewComponent, canActivate: [AUTHGUARD] },
];
