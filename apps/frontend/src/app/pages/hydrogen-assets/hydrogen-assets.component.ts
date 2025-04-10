import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { assetTabs } from './config/tabs';
import { HydrogenProductionTableComponent } from './tables/hydrogen-production-table/hydrogen-production-table.component';
import { HydrogenStorageTableComponent } from './tables/hydrogen-storage-table/hydrogen-storage-table.component';

@Component({
  selector: 'app-hydrogen-assets',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatTabsModule,
    HydrogenProductionTableComponent,
    HydrogenStorageTableComponent,
  ],
  providers: [],
  templateUrl: './hydrogen-assets.component.html',
  styleUrl: './hydrogen-assets.component.scss',
})
export class HydrogenAssetsComponent {
  assetTabs = assetTabs;
  displayedTabs: string[] = [assetTabs.PRODUCTION, assetTabs.STORAGE];
}
