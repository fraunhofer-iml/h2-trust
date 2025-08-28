import { Route } from '@angular/router';
import { CreateUnitComponent } from './create/create-unit.component';
import { HydrogenAssetsComponent } from './hydrogen-assets.component';

export const HYDROGEN_ASSETS_ROUTES: Route[] = [
  {
    path: '',
    component: HydrogenAssetsComponent,
  },
  { path: 'create', component: CreateUnitComponent },
];
