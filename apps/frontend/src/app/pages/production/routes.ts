import { Route } from '@angular/router';
import { ProductionViewComponent } from './production-view.component';

export const PRODUCTION_ROUTES: Route[] = [
  {
    path: '',
    component: ProductionViewComponent,
  },
];
