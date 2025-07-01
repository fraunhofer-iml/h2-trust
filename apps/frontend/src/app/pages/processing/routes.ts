import { Route } from '@angular/router';
import { ProductPassComponent } from './details/product-pass.component';
import { ProcessingOverviewComponent } from './processing-overview.component';

export const PROCESSING_ROUTES: Route[] = [
  {
    path: '',
    component: ProcessingOverviewComponent,
  },
  {
    path: ':id',
    component: ProductPassComponent,
  },
];
