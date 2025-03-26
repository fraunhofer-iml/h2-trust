import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../shared/services/auth/auth.service';
import { UnitsService } from '../../shared/services/units/units.service';
import { UsersService } from '../../shared/services/users/users.service';
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
  providers: [AuthService, UsersService, UnitsService],
  templateUrl: './hydrogen-assets.component.html',
  styleUrl: './hydrogen-assets.component.scss',
})
export class HydrogenAssetsComponent {
  assetTabs = assetTabs;
  displayedTabs: string[] = [assetTabs.PRODUCTION, assetTabs.STORAGE];
}
