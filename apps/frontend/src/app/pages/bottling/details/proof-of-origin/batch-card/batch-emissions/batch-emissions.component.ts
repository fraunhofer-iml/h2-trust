import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { EmissionDto } from '@h2-trust/api';
import { FormattedUnits } from '../../../../../../shared/constants/formatted-units';

@Component({
  selector: 'app-batch-emissions',
  imports: [CommonModule],
  templateUrl: './batch-emissions.component.html',
})
export class BatchEmissionsComponent {
  emissions = input.required<EmissionDto>();
  protected readonly FormattedUnits = FormattedUnits;
}
