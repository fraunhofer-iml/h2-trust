import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ProcessingOverviewDto, UserDetailsDto } from '@h2-trust/api';
import { ProcessFilter } from '../../model/process-filter';
import { AuthService } from '../../shared/services/auth/auth.service';
import { ProcessService } from '../../shared/services/process/process.service';
import { UsersService } from '../../shared/services/users/users.service';
import { processSet } from '../hydrogen-assets/config/table-set';

@Component({
  selector: 'app-processing-overview',
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatTableModule, MatPaginatorModule],
  providers: [ProcessService],
  templateUrl: './processing-overview.component.html',
  styleUrl: './processing-overview.component.scss',
})
export class ProcessingOverviewComponent implements OnInit, AfterViewInit {
  userId: string;
  displayedColumns: string[];
  dataSource: MatTableDataSource<ProcessingOverviewDto> = new MatTableDataSource<ProcessingOverviewDto>();
  dataSource$!: Observable<MatTableDataSource<ProcessingOverviewDto>>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly processService: ProcessService,
  ) {
    this.userId = '';
    this.displayedColumns = processSet;
  }

  async ngOnInit() {
    this.userId = await this.authService.getUserId();
    if (this.userId) {
      this.usersService.getUserAccountInformation(this.userId).subscribe((userDetails: UserDetailsDto) => {
        this.initializeTableData(userDetails.company.id);
      });
    }
  }

  initializeTableData(companyId: string) {
    this.dataSource$ = this.processService.getProcessesOfCompany(<ProcessFilter>{ companyId: companyId }).pipe(
      map((processes: ProcessingOverviewDto[]) => {
        processes.forEach((data) => {
          data.color = JSON.parse(data.color ?? '').color;
        });
        this.dataSource.data = processes;
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
