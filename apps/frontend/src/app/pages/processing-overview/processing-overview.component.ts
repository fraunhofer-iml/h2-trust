import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ProcessingOverviewDto, UserDetailsDto } from '@h2-trust/api';
import { ProcessingFilter } from '../../model/process-filter';
import { AuthService } from '../../shared/services/auth/auth.service';
import { ProcessingService } from '../../shared/services/processing/processing.service';
import { UsersService } from '../../shared/services/users/users.service';
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
  ],
  providers: [ProcessingService],
  templateUrl: './processing-overview.component.html',
  styleUrl: './processing-overview.component.scss',
})
export class ProcessingOverviewComponent implements OnInit, AfterViewInit {
  displayedColumns: string[];
  userId: string;

  dataSource: MatTableDataSource<ProcessingOverviewDto> = new MatTableDataSource<ProcessingOverviewDto>();
  dataSource$!: Observable<MatTableDataSource<ProcessingOverviewDto>>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly processService: ProcessingService,
    private readonly dialog: MatDialog,
  ) {
    this.userId = '';
    this.displayedColumns = processSet;
  }

  async ngOnInit() {
    const userId = await this.authService.getUserId();
    if (userId) {
      this.userId = userId;
      this.fetchTableData(userId);
    } else {
      throw new Error('No userId received');
    }
  }

  fetchTableData(userId: string) {
    this.usersService.getUserAccountInformation(userId).subscribe((userDetails: UserDetailsDto) => {
      this.dataSource$ = this.processService
        .getProcessingDataOfCompany(<ProcessingFilter>{ companyId: userDetails.company.id })
        .pipe(
          map((processes: ProcessingOverviewDto[]) => {
            processes.forEach((data) => {
              try {
                data.color = JSON.parse(data.color ?? '').color ?? '';
              } catch (error) {
                throw new Error('Could not parse color : ' + error);
              }
            });
            this.dataSource.data = processes;
            return this.dataSource;
          }),
        );
    });
  }

  openBottleDialog() {
    const dialogRef = this.dialog.open(AddBottleComponent, {
      hasBackdrop: true,
      disableClose: false,
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result: FormData) => {
      if (result !== undefined) {
        this.processService.createBottleBatch(result).subscribe((res) => {
          this.fetchTableData(this.userId);
        });
      }
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
