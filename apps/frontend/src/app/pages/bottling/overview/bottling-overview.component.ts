import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { BottlingOverviewDto } from '@h2-trust/api';
import { H2ColorChipComponent } from '../../../layout/h2-color-chip/h2-color-chip.component';
import { BottlingService } from '../../../shared/services/bottling/bottling.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { AddBottleComponent } from '../add-bottle/add-bottle.component';
import { StorageFillingLevelsComponent } from './storage-filling-levels/storage-filling-levels.component';

@Component({
  selector: 'app-processing-overview',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSortModule,
    RouterModule,
    H2ColorChipComponent,
    StorageFillingLevelsComponent,
  ],
  providers: [BottlingService],
  templateUrl: './bottling-overview.component.html',
})
export class BottlingOverviewComponent implements AfterViewInit {
  displayedColumns = ['filledAt', 'owner', 'filledAmount', 'color'];

  dataSource: MatTableDataSource<BottlingOverviewDto> = new MatTableDataSource<BottlingOverviewDto>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  unitsService = inject<UnitsService>(UnitsService);

  constructor(
    private readonly processService: BottlingService,
    private readonly dialog: MatDialog,
  ) {}

  processingQuery = injectQuery(() => ({
    queryKey: ['processing'],
    queryFn: async () => {
      const data = await this.processService.getBottlings();
      this.dataSource.data = data;
      return data;
    },
  }));

  hydrogenStorageQuery = injectQuery(() => ({
    queryKey: ['h2-storage'],
    queryFn: async () => {
      return this.unitsService.getHydrogenStorageUnits();
    },
  }));

  openBottleDialog() {
    const dialogRef = this.dialog.open(AddBottleComponent, {
      hasBackdrop: true,
      disableClose: true,
      autoFocus: true,
      minWidth: '48rem',
      minHeight: '40rem',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.processingQuery.refetch();
        this.hydrogenStorageQuery.refetch();
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
