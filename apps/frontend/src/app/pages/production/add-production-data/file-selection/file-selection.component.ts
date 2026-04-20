import { ROUTES } from 'apps/frontend/src/app/shared/constants/routes';
import { PowerAccessApprovalService } from 'apps/frontend/src/app/shared/services/power-access-approvals/power-access-approvals.service';
import { ProductionService } from 'apps/frontend/src/app/shared/services/production/production.service';
import { UnitsService } from 'apps/frontend/src/app/shared/services/units/units.service';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { StagedProductionDto, StagingSubmissionDto } from '@h2-trust/api';
import { BatchType, MeasurementUnit, PowerAccessApprovalStatus } from '@h2-trust/domain';
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
  protected readonly productionService = inject(ProductionService);
  protected readonly powerAccessApprovalsService = inject(PowerAccessApprovalService);
  protected readonly unitsService = inject(UnitsService);
  protected readonly MeasurementUnit = MeasurementUnit;
  private readonly router = inject(Router);

  form = new FormGroup({
    hydrogenProduction: new FormControl<StagedProductionDto[] | null>(null, [
      Validators.required,
      Validators.minLength(1),
    ]),
    powerProductions: new FormControl<StagedProductionDto[] | null>([], [Validators.required, Validators.minLength(1)]),
    storageUnit: new FormControl<string | null>({ value: null, disabled: true }, Validators.required),
  });

  selectedHydrogenFile = signal<StagedProductionDto | null>(null);

  powerProductionsQuery = injectQuery(() => ({
    queryKey: [
      'power-production',
      this.selectedHydrogenFile()?.startedAt,
      this.selectedHydrogenFile()?.endedAt,
      BatchType.POWER,
    ],
    queryFn: async () =>
      this.productionService.getStagedProductions(
        BatchType.POWER,
        'received',
        this.selectedHydrogenFile()?.startedAt,
        this.selectedHydrogenFile()?.endedAt,
      ),
  }));

  hydrogenProductionsQuery = injectQuery(() => ({
    queryKey: ['hydrogen-production'],
    queryFn: async () => {
      return this.productionService.getStagedProductions(BatchType.HYDROGEN, 'own');
    },
  }));

  approvalsQuery = injectQuery(() => ({
    queryKey: ['power-access-approvals'],
    queryFn: async () => {
      const approvals = await this.powerAccessApprovalsService.getApprovals(PowerAccessApprovalStatus.APPROVED);
      return approvals.filter((a) => a.energySource !== 'GRID');
    },
  }));

  storageUnitsQuery = injectQuery(() => ({
    queryKey: ['hydrogen-storage-unit'],
    queryFn: () => this.unitsService.getHydrogenStorageUnits(),
  }));

  data = computed(() => {
    const uploads = this.powerProductionsQuery.data();
    const approvals = this.approvalsQuery.data();

    console.log(uploads);

    const result = (approvals ?? []).map((ppa) => ({
      ...ppa,
      uploads: (uploads ?? []).filter((r) => r.productionUnitId === ppa.powerProductionUnit.id),
    }));

    return result;
  });

  get totalPower() {
    return this.form.controls.powerProductions.value?.reduce((acc, item) => acc + item.amountProduced, 0);
  }

  mutation = injectMutation(() => ({
    mutationFn: (dto: StagingSubmissionDto) => this.productionService.submitCsv(dto),
    onSuccess: () => this.router.navigateByUrl(ROUTES.PRODUCTION_DATA),
    onError: (e: HttpErrorResponse) => toast.error(e.error.message),
  }));

  constructor() {
    this.form.controls.hydrogenProduction.valueChanges.subscribe((val) => {
      this.selectedHydrogenFile.set(val ? val[0] : null);
      if (val && val.length > 0) {
        this.form.controls.storageUnit.enable();
        this.form.controls.powerProductions.patchValue([]);
      }
    });
  }

  save() {
    const { hydrogenProduction, storageUnit, powerProductions } = this.form.value;
    if (!hydrogenProduction || !storageUnit || powerProductions?.length === 0) return;

    const dto: StagingSubmissionDto = {
      storageUnitId: storageUnit,
      stagedHydrogenProduction: hydrogenProduction[0].id,
      stagedPowerProductions: (powerProductions ?? []).map((item) => item.id),
    };

    this.mutation.mutate(dto);
  }
}
