import { PowerAccessApprovalService } from 'apps/frontend/src/app/shared/services/power-access-approvals/power-access-approvals.service';
import { ProductionService } from 'apps/frontend/src/app/shared/services/production/production.service';
import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ProcessedCsvDto } from '@h2-trust/api';
import { MeasurementUnit, PowerAccessApprovalStatus } from '@h2-trust/domain';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';

@Component({
  selector: 'app-file-selection',
  imports: [
    RouterModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    UnitPipe,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatChipsModule,
    MatButtonModule,
  ],
  templateUrl: './file-selection.component.html',
})
export class FileSelectionComponent {
  protected productionService = inject(ProductionService);
  protected readonly powerAccessApprovalsService = inject(PowerAccessApprovalService);
  protected readonly MeasurementUnit = MeasurementUnit;

  form = new FormGroup({
    hydrogenFileId: new FormControl<string | null>(null),
    powerFiles: new FormControl<ProcessedCsvDto[] | null>([]),
  });

  uploadsQuery = injectQuery(() => ({
    queryKey: ['production'],
    queryFn: async () => {
      const data = await this.productionService.getUploadedCsvFiles();
      return [...data, ...data, ...data, ...data, ...data];
    },
  }));

  approvalsQuery = injectQuery(() => ({
    queryKey: ['power-access-approvals'],
    queryFn: async () => this.powerAccessApprovalsService.getApprovals(PowerAccessApprovalStatus.APPROVED),
  }));

  data = computed(() => {
    // const uploads = this.uploadsQuery.data();
    // const approvals = this.approvalsQuery.data();
  });

  onSelectionChange(selectedOptions: ProcessedCsvDto[]): void {
    this.form.controls.powerFiles.patchValue(selectedOptions);
  }

  get totalPower() {
    return this.form.controls.powerFiles.value?.reduce((acc, item) => acc + item.amount, 0);
  }

  constructor() {
    this.form.controls.hydrogenFileId.valueChanges.subscribe(() => {
      this.form.controls.powerFiles.patchValue([]);
    });
  }
}
