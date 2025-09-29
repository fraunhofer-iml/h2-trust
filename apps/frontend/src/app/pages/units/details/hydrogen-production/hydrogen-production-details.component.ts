import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HydrogenProductionUnitDto } from '@h2-trust/api';

@Component({
  selector: 'app-hydrogen-production-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './hydrogen-production-details.component.html',
})
export class HydrogenProductionDetailsComponent {
  unit = input.required<HydrogenProductionUnitDto>();
}
