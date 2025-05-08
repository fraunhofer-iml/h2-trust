import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ProductionOverviewDto, UserDetailsDto } from '@h2-trust/api';
import { AuthService } from '../../shared/services/auth/auth.service';
import { ProductionService } from '../../shared/services/production/production.service';
import { UsersService } from '../../shared/services/users/users.service';
import { productionSet } from '../hydrogen-assets/config/table-set';

@Component({
  selector: 'app-production-view',
  imports: [
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatTabsModule,
    MatPaginatorModule,
  ],
  providers: [ProductionService],
  templateUrl: './production-view.component.html',
  styleUrl: './production-view.component.scss',
})
export class ProductionViewComponent implements AfterViewInit {
  displayedColumns: string[];
  dataSource: MatTableDataSource<ProductionOverviewDto> = new MatTableDataSource<ProductionOverviewDto>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly productionService: ProductionService,
  ) {
    this.displayedColumns = productionSet;
    this.setTableData();
  }

  setTableData() {
    this.authService.getUserId().then((userId: string) => {
      this.fetchData(userId);
    });
  }

  fetchData(userId: string) {
    this.usersService.getUserAccountInformation(userId).subscribe((userDetails: UserDetailsDto) => {
      this.productionService
        .getProductionOverview(userDetails.company.id)
        .subscribe((processes: ProductionOverviewDto[]) => {
          this.dataSource.data = processes;
        });
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
