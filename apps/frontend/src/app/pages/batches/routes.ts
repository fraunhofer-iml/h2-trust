import { Route } from '@angular/router';
import { canActivateAuth } from '../../guards/auth.guard';
import { BatchPageComponent } from './batch-page.component';

export const BATCH_ROUTES: Route[] = [
  {
    path: '',
    canActivate: [canActivateAuth],
    component: BatchPageComponent,
  },
];
