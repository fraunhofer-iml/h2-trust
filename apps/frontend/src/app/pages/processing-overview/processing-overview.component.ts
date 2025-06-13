import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ProcessingOverviewDto } from '@h2-trust/api';
import { ProcessingService } from '../../shared/services/processing/processing.service';
import { processSet } from '../hydrogen-assets/config/table-set';
import { AddBottleComponent } from './add-bottle/add-bottle.component';

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
  ],
  providers: [ProcessingService],
  templateUrl: './processing-overview.component.html',
})
export class ProcessingOverviewComponent implements AfterViewInit {
  displayedColumns = processSet;

  dataSource: MatTableDataSource<ProcessingOverviewDto> = new MatTableDataSource<ProcessingOverviewDto>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly processService: ProcessingService,
    private readonly dialog: MatDialog,
  ) {}

  processingQuery = injectQuery(() => ({
    queryKey: ['processing'],
    queryFn: async () => {
      const data = await this.processService.getProcessingDataOfCompany();
      this.dataSource.data = data;
      return data;
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
      if (result) this.processingQuery.refetch();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
