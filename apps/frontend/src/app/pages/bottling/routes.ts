import { Route } from '@angular/router';
import { ProductPassComponent } from './details/product-pass.component';
import { BottlingOverviewComponent } from './overview/bottling-overview.component';

export const BOTTLING_ROUTES: Route[] = [
  {
    path: '',
    component: BottlingOverviewComponent,
  },
  {
    path: ':id',
    component: ProductPassComponent,
  },
];
