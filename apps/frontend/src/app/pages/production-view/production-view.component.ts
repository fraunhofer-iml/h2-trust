import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ProductionOverviewDto } from '@h2-trust/api';
import { ProductionService } from '../../shared/services/production/production.service';
import { productionSet } from '../hydrogen-assets/config/table-set';

@Component({
  selector: 'app-production-view',
  imports: [FormsModule, MatPaginatorModule, MatTableModule, DatePipe, DecimalPipe, TitleCasePipe],
  providers: [ProductionService],
  templateUrl: './production-view.component.html',
})
export class ProductionViewComponent implements AfterViewInit {
  displayedColumns = productionSet;
  dataSource: MatTableDataSource<ProductionOverviewDto> = new MatTableDataSource<ProductionOverviewDto>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  productionService = inject(ProductionService);

  productionQuery = injectQuery(() => ({
    queryKey: ['production'],
    queryFn: async () => {
      const data = await this.productionService.getProductionOverview();
      this.dataSource.data = data;
      return data;
    },
  }));

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
