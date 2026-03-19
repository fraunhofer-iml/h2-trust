import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  BiddingZone,
  GridLevel,
  HydrogenProductionMethod,
  HydrogenProductionTechnology,
  PowerProductionType,
} from '@h2-trust/domain';
import { PrettyEnumPipe } from '../../../../shared/pipes/format-enum.pipe';
import { HydrogenProductionFormGroup } from '../../create/forms';

@Component({
  selector: 'app-hydrogen-production-unit-form',
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    PrettyEnumPipe,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './hydrogen-production-unit-form.component.html',
})
export class HydrogenProductionUnitFormComponent {
  protected readonly HydrogenProductionMethod = HydrogenProductionMethod;

  availableBiddingZones = Object.values(BiddingZone);
  availableGridLevels = Object.entries(GridLevel);
  availableTechnologies: [string, HydrogenProductionTechnology][] = [];
  availablePowerProductionType = Object.entries(PowerProductionType);

  hydrogenProductionForm = input.required<FormGroup<HydrogenProductionFormGroup>>();
}
