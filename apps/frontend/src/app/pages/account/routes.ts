import { Route } from '@angular/router';
import { AccountOverviewComponent } from './account-overview/account-overview.component';

export const ACCOUNT_ROUTES: Route[] = [
  {
    path: '',
    component: AccountOverviewComponent,
  },
];
