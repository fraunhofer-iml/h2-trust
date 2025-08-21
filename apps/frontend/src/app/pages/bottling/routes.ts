import { Route } from '@angular/router';
import { AUTH_GUARD } from '../../guards/auth.guard';
import { AddBottleComponent } from './add-bottle/add-bottle.component';
import { ProductPassComponent } from './details/product-pass.component';
import { BottlingOverviewComponent } from './overview/bottling-overview.component';

export const BOTTLING_ROUTES: Route[] = [
  {
    path: '',
    canActivate: [AUTH_GUARD],
    component: BottlingOverviewComponent,
  },
  {
    path: 'create',
    component: AddBottleComponent,
  },
  {
    path: ':id',
    component: ProductPassComponent,
  },
];
