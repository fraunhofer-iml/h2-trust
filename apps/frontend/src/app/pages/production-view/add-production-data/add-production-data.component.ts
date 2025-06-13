import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import {
  CreateProductionDto,
  HydrogenProductionOverviewDto,
  PowerAccessApprovalStatus,
  PowerProductionOverviewDto,
} from '@h2-trust/api';
import { ErrorCardComponent } from '../../../layout/error-card/error-card.component';
import { ERROR_MESSAGES } from '../../../shared/constants/error.messages';
import { CompaniesService } from '../../../shared/services/companies/companies.service';
import { PowerAccessApprovalService } from '../../../shared/services/power-access-approvals/power-access-approvals.service';
import { ProductionService } from '../../../shared/services/production/production.service';
import { UnitsService } from '../../../shared/services/units/units.service';

@Component({
  selector: 'app-add-production-data',
  providers: [provideNativeDateAdapter(), CompaniesService, ProductionService, PowerAccessApprovalService],
  imports: [
    MatDialogModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatTimepickerModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    ErrorCardComponent,
  ],
  templateUrl: './add-production-data.component.html',
})
export class AddProductionDataComponent {
  ERROR_MESSAGES = ERROR_MESSAGES;

  form = new FormGroup<{
    productionStartedAt: FormControl<Date | null>;
    productionEndedAt: FormControl<Date | null>;
    powerProductionUnit: FormControl<PowerProductionOverviewDto | null>;
    powerAmountKwh: FormControl<number | null>;
    hydrogenProductionUnit: FormControl<HydrogenProductionOverviewDto | null>;
    hydrogenAmountKg: FormControl<number | null>;
  }>({
    productionStartedAt: new FormControl<Date | null>(new Date(), Validators.required),
    productionEndedAt: new FormControl<Date | null>(new Date(), Validators.required),
    powerProductionUnit: new FormControl<PowerProductionOverviewDto | null>(null, Validators.required),
    powerAmountKwh: new FormControl<number | null>(null, Validators.required),
    hydrogenProductionUnit: new FormControl<HydrogenProductionOverviewDto | null>(null, Validators.required),
    hydrogenAmountKg: new FormControl<number | null>(null, Validators.required),
  });

  approvalsQuery = injectQuery(() => ({
    queryKey: ['power-access-approvals'],
    queryFn: async () => this.powerAccessApprovalsService.getApprovals(PowerAccessApprovalStatus.APPROVED),
  }));

  hydrogenProductionQuery = injectQuery(() => ({
    queryKey: ['h2-production'],
    queryFn: async () => this.unitsService.getHydrogenProductionUnits(),
  }));

  mutation = injectMutation(() => ({
    mutationFn: (dto: CreateProductionDto) => this.productionService.addProductionData(dto),
    onSuccess: () => {
      this.dialogRef.close(true);
    },
  }));

  constructor(
    public dialogRef: MatDialogRef<AddProductionDataComponent>,
    private readonly unitsService: UnitsService,
    private readonly powerAccessApprovalsService: PowerAccessApprovalService,
    private readonly productionService: ProductionService,
  ) {}

  submit() {
    const dto: CreateProductionDto = {
      productionStartedAt: this.form.value.productionStartedAt?.toISOString() ?? new Date().toISOString(),
      productionEndedAt: this.form.value.productionEndedAt?.toISOString() ?? new Date().toISOString(),
      hydrogenProductionUnitId: this.form.value.hydrogenProductionUnit?.id ?? '',
      powerProductionUnitId: this.form.value.powerProductionUnit?.id ?? '',
      hydrogenAmountKg: this.form.value.hydrogenAmountKg ?? 0,
      powerAmountKwh: this.form.value.powerAmountKwh ?? 0,
    };
    this.mutation.mutate(dto);
  }
}
