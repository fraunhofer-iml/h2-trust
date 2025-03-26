import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { HydrogenProductionOverviewDto, UserDetailsDto } from '@h2-trust/api';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { UnitsService } from '../../../../shared/services/units/units.service';
import { UsersService } from '../../../../shared/services/users/users.service';
import { hydrogenProductionSet } from '../../config/table-set';

@Component({
  selector: 'app-hydrogen-production-table',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatTabsModule,
    MatPaginatorModule,
  ],
  templateUrl: './hydrogen-production-table.component.html',
  styleUrl: './hydrogen-production-table.component.scss',
})
export class HydrogenProductionTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[];
  dataSource: MatTableDataSource<HydrogenProductionOverviewDto> =
    new MatTableDataSource<HydrogenProductionOverviewDto>();
  dataSource$!: Observable<MatTableDataSource<HydrogenProductionOverviewDto>>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly unitsService: UnitsService,
  ) {
    this.displayedColumns = hydrogenProductionSet;
  }

  ngOnInit(): void {
    this.usersService
      .getUserAccountInformation(this.authService.getUserId())
      .subscribe((userDetails: UserDetailsDto) => {
        this.initializeTableData(userDetails.company.id);
      });
  }

  initializeTableData(companyId: string) {
    this.dataSource$ = this.unitsService.getHydrogenProductionUnitsOfCompany(companyId).pipe(
      map((units: HydrogenProductionOverviewDto[]) => {
        this.dataSource.data = units;
        return this.dataSource;
      }),
    );
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
