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
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { BottlingOverviewDto } from '@h2-trust/api';
import { H2ColorChipComponent } from '../../../layout/h2-color-chip/h2-color-chip.component';
import { BottlingService } from '../../../shared/services/bottling/bottling.service';
import { AddBottleComponent } from '../add-bottle/add-bottle.component';

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
  ],
  providers: [BottlingService],
  templateUrl: './bottling-overview.component.html',
})
export class BottlingOverviewComponent implements AfterViewInit {
  displayedColumns = ['filledAt', 'owner', 'filledAmount', 'color'];

  dataSource: MatTableDataSource<BottlingOverviewDto> = new MatTableDataSource<BottlingOverviewDto>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
