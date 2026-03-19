import { Component, inject, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { HydrogenStorageUnitDto } from '@h2-trust/api';
import { HydrogenStorageType } from '@h2-trust/domain';
import { UnitTypeChipComponent } from '../../../layout/unit-type-chip/unit-type-chip.component';
import { UnitsService } from '../../../shared/services/units/units.service';
import { BaseUnitFormComponent } from '../forms/base-unit/base-unit-form-component';
import { HydrogenStorageFormGroup, newH2StorageForm, newUnitForm, UnitFormGroup } from '../forms/forms';
import { HydrogenUnitFormComponent } from '../forms/hydrogen-storage/hydrogen-storage-unit-form.component';

@Component({
  selector: 'app-hydrogen-storage-unit-update',
  imports: [BaseUnitFormComponent, HydrogenUnitFormComponent, RouterModule, UnitTypeChipComponent, MatButtonModule],
  templateUrl: './hydrogen-storage-unit-update.component.html',
})
export class HydrogenStorageUnitUpdateComponent {
  unitForm: FormGroup<UnitFormGroup> = newUnitForm();
  hydrogenStorageUnitForm: FormGroup<HydrogenStorageFormGroup> = newH2StorageForm();

  id = input<string>();

  unitsService = inject(UnitsService);

  unitQuery = injectQuery(() => ({
    queryKey: ['power-production-unit', this.id()],
    queryFn: async () => {
      const unit = await this.unitsService.getHydrogenStorageUnit(this.id() ?? '');
      this.setFormData(unit);
      return unit;
    },
    enabled: !!this.id(),
  }));

  private setFormData(unit: HydrogenStorageUnitDto) {
    this.unitForm.patchValue({ ...unit, owner: unit.owner.id, operator: unit.operator });
    this.hydrogenStorageUnitForm.patchValue({
      ...unit,
      hydrogenStorageType: unit.storageType as HydrogenStorageType,
    });
  }
}
