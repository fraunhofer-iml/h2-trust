import { Component, inject, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { HydrogenProductionUnitDto } from '@h2-trust/api';
import { BiddingZone, HydrogenProductionMethod, HydrogenProductionTechnology } from '@h2-trust/domain';
import { UnitTypeChipComponent } from '../../../layout/unit-type-chip/unit-type-chip.component';
import { UnitsService } from '../../../shared/services/units/units.service';
import { BaseUnitFormComponent } from '../forms/base-unit/base-unit-form-component';
import { HydrogenProductionFormGroup, newH2ProductionForm, newUnitForm, UnitFormGroup } from '../forms/forms';
import { HydrogenProductionUnitFormComponent } from '../forms/hydrogen-production/hydrogen-production-unit-form.component';

@Component({
  selector: 'app-hydrogen-production-unit-update',
  imports: [
    BaseUnitFormComponent,
    HydrogenProductionUnitFormComponent,
    UnitTypeChipComponent,
    RouterModule,
    MatButtonModule,
  ],
  templateUrl: './hydrogen-production-unit-update.component.html',
})
export class HydrogenProductionUnitUpdateComponent {
  unitForm: FormGroup<UnitFormGroup> = newUnitForm();
  hydrogenProductionForm: FormGroup<HydrogenProductionFormGroup> = newH2ProductionForm();

  id = input<string>();

  unitsService = inject(UnitsService);

  unitQuery = injectQuery(() => ({
    queryKey: ['hydrogen-production-unit', this.id()],
    queryFn: async () => {
      const unit = await this.unitsService.getHydrogenProductionUnit(this.id() ?? '');
      this.setFormData(unit);
      return unit;
    },
    enabled: !!this.id(),
  }));

  private setFormData(unit: HydrogenProductionUnitDto) {
    this.unitForm.patchValue({ ...unit, owner: unit.owner.id, operator: unit.operator });
    this.hydrogenProductionForm.patchValue({
      ...unit,
      biddingZone: unit.biddingZone as BiddingZone,
      method: unit.method as HydrogenProductionMethod,
      technology: unit.technology as HydrogenProductionTechnology,
    });
  }
}
