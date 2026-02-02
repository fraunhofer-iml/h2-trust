import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { CsvContentType, ProcessedCsvDto } from '@h2-trust/api';
import { ICONS } from '../../../shared/constants/icons';
import { ProductionService } from '../../../shared/services/production/production.service';

@Component({
  selector: 'app-production-files',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltip,
    MatDivider,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatLabel,
    MatSelectModule,
  ],
  providers: [ProductionService, provideNativeDateAdapter()],
  templateUrl: './production-files.component.html',
})
export class ProductionFilesComponent implements AfterViewInit {
  protected readonly ICONS = ICONS.UNITS;
  readonly displayedColumns = ['name', 'uploadedBy', 'startedAt', 'endedAt', 'type', 'button'];
  readonly displayCsvContentTypes: { name: string; value: CsvContentType | null }[] = [
    { name: 'Hydrogen', value: 'HYDROGEN' },
    { name: 'Power', value: 'POWER' },
    { name: 'All', value: null },
  ];

  productionService = inject(ProductionService);

  dataSource: MatTableDataSource<ProcessedCsvDto> = new MatTableDataSource<ProcessedCsvDto>();
  typeToShow$ = signal<CsvContentType | null>(null);
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  searchTerm = signal<string>('');

  searchControl = new FormControl<string>('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  upoadsQuery = injectQuery(() => ({
    queryKey: ['production'],
    queryFn: async () => {
      const data = await this.productionService.getUploadedCsvFiles();
      this.dataSource.data = data;
      return data;
    },
  }));

  datasource$ = computed(() => {
    let data = this.upoadsQuery.data() ?? [];

    const typeToShow = this.typeToShow$();
    const start = this.startDate();
    const end = this.endDate();
    const search = this.searchTerm();

    if (typeToShow) data = data.filter((item) => item.csvContentType === typeToShow);

    if (start && end) {
      data = data.filter((item) => {
        const itemStart = new Date(item.startedAt);
        const itemEnd = new Date(item.endedAt);
        return itemStart <= end && itemEnd >= start;
      });
    }

    if (search) {
      data = data.filter(
        (item) => item.name.toLowerCase().includes(search) || item.uploadedBy.toLocaleLowerCase().includes(search),
      );
    }

    return data;
  });

  constructor() {
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((value) => {
      this.searchTerm.set((value ?? '').toLowerCase());
    });
    effect(() => {
      this.dataSource.data = this.datasource$();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  toggle(value: CsvContentType | null) {
    console.log(this.typeToShow$());
    console.log(value);
    this.typeToShow$.set(value);
  }

  setStart(date: Date | null) {
    this.startDate.set(date);
  }

  setEnd(date: Date | null) {
    this.endDate.set(date);
  }
}
