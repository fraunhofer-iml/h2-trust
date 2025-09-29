import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { PowerProductionUnitDto } from '@h2-trust/api';
import { PrettyEnumPipe } from '../../../../shared/pipes/format-enum.pipe';

@Component({
  selector: 'app-power-production-details',
  imports: [CommonModule, PrettyEnumPipe],
  templateUrl: './power-production-details.component.html',
})
export class PowerProductionDetailsComponent {
  unit = input.required<PowerProductionUnitDto>();
}
