import { Route } from '@angular/router';
import { canActivateAuth } from '../../guards/auth.guard';
import { CreateBatchPageComponent } from './create/create-batch-page.component';
import { ProductPassComponent } from './dpp/product-pass.component';
import { BatchPageComponent } from './overview/batch-page.component';

export const BATCH_ROUTES: Route[] = [
  {
    path: '',
    canActivate: [canActivateAuth],
    component: BatchPageComponent,
  },
  {
    path: 'create',
    canActivate: [canActivateAuth],
    component: CreateBatchPageComponent,
  },
  {
    path: ':id',
    canActivate: [canActivateAuth],
    component: ProductPassComponent,
  },
];
