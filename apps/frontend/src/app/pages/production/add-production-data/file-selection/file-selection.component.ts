import { PowerAccessApprovalService } from 'apps/frontend/src/app/shared/services/power-access-approvals/power-access-approvals.service';
import { ProductionService } from 'apps/frontend/src/app/shared/services/production/production.service';
import { UnitsService } from 'apps/frontend/src/app/shared/services/units/units.service';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { StagedProductionDto } from '@h2-trust/api';
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
  protected productionService = inject(ProductionService);
  protected readonly powerAccessApprovalsService = inject(PowerAccessApprovalService);
  protected readonly unitsService = inject(UnitsService);
  protected readonly MeasurementUnit = MeasurementUnit;

  form = new FormGroup({
    hydrogenFile: new FormControl<StagedProductionDto[] | null>(null, [Validators.required, Validators.minLength(1)]),
    powerFiles: new FormControl<StagedProductionDto[] | null>([], [Validators.required, Validators.minLength(1)]),
    storageUnit: new FormControl<string | null>({ value: null, disabled: true }, Validators.required),
  });

  selectedHydrogenFile = toSignal<StagedProductionDto | undefined | null>(
    this.form.controls.hydrogenFile.valueChanges.pipe(map((val) => (val ? val[0] : val))),
  );

  powerProductionsQuery = injectQuery(() => ({
    queryKey: ['production', this.selectedHydrogenFile()],
    queryFn: async () => {
      console.log(this.selectedHydrogenFile());
      return this.productionService.getStagedProductions(
        BatchType.POWER,
        'received',
        this.selectedHydrogenFile()?.startedAt,
        this.selectedHydrogenFile()?.endedAt,
      );
    },
  }));

  hydrogenProductionsQuery = injectQuery(() => ({
    queryKey: ['production'],
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

    const result = (approvals ?? []).map((ppa) => ({
      ...ppa,
      uploads: (uploads ?? []).filter((r) => r.productionUnitId === ppa.powerProductionUnit.id),
    }));

    return result;
  });

  get totalPower() {
    return this.form.controls.powerFiles.value?.reduce((acc, item) => acc + item.amountProduced, 0);
  }

  constructor() {
    this.form.controls.hydrogenFile.valueChanges.subscribe(() => {
      this.form.controls.powerFiles.patchValue([]);
    });

    this.form.controls.powerFiles.valueChanges.subscribe((val) => {
      if (val && val.length > 0) this.form.controls.storageUnit.enable();
    });
  }
}
