import { CompaniesService } from 'apps/frontend/src/app/shared/services/companies/companies.service';
import { UnitsService } from 'apps/frontend/src/app/shared/services/units/units.service';
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { UnitFormGroup } from '../forms';

@Component({
  selector: 'app-base-unit-form',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  providers: [provideNativeDateAdapter()],

  templateUrl: './base-unit-form.component.html',
})
export class BaseUnitFormComponent {
  unitsService = inject(UnitsService);
  companiesService = inject(CompaniesService);

  unitForm = input.required<FormGroup<UnitFormGroup>>();

  companiesQuery = injectQuery(() => ({
    queryKey: ['recipients'],
    queryFn: () => this.companiesService.getCompanies(),
  }));
}
