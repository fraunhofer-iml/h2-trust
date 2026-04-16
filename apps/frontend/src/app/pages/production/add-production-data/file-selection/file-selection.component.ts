import { PowerAccessApprovalService } from 'apps/frontend/src/app/shared/services/power-access-approvals/power-access-approvals.service';
import { ProductionService } from 'apps/frontend/src/app/shared/services/production/production.service';
import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
    hydrogenFileId: new FormControl<string | null>(null, Validators.required),
    powerFiles: new FormControl<ProcessedCsvDto[] | null>([], [Validators.required, Validators.minLength(1)]),
  });

  uploadsQuery = injectQuery(() => ({
    queryKey: ['production'],
    queryFn: async () => {
      return this.productionService.getUploadedCsvFiles();
    },
  }));

  approvalsQuery = injectQuery(() => ({
    queryKey: ['power-access-approvals'],
    queryFn: async () => {
      const approvals = await this.powerAccessApprovalsService.getApprovals(PowerAccessApprovalStatus.APPROVED);
      return approvals.filter((a) => a.energySource !== 'GRID');
    },
  }));

  data = computed(() => {
    const uploads = this.uploadsQuery.data();
    const approvals = this.approvalsQuery.data();

    const result = (approvals ?? []).map((ppa) => ({
      ...ppa,
      uploads: (uploads ?? []).filter((r) => r.unitId === ppa.powerProductionUnit.id),
    }));

    return result;
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
