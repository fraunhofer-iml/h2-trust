import { Route } from '@angular/router';
import { AUTH_GUARD } from '../../guards/auth.guard';
import { ProductPassComponent } from './details/product-pass.component';
import { BottlingOverviewComponent } from './overview/bottling-overview.component';

export const BOTTLING_ROUTES: Route[] = [
  {
    path: '',
    canActivate: [AUTH_GUARD],
    component: BottlingOverviewComponent,
  },
  {
    path: ':id',
    component: ProductPassComponent,
  },
];
