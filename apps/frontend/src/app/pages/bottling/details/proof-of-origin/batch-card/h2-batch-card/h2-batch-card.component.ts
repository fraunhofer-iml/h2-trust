import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { HydrogenBatchDto } from '@h2-trust/api';
import { H2ColorChipComponent } from '../../../../../../layout/h2-color-chip/h2-color-chip.component';
import { RfnboChipComponent } from '../../../../../../layout/rfnbo-chip/rfnbo-chip.component';
import { BaseSheetComponent } from '../../../../../../layout/sheet/sheet.component';
import { VerifiedChartComponent } from '../../../../../../layout/verified-chart/verified-chart.component';
import { PrettyEnumPipe } from '../../../../../../shared/pipes/format-enum.pipe';
import { H2CompositionChartComponent } from '../../../chart/h2-composition-chart.component';

@Component({
  selector: 'app-h2-batch-card',
  imports: [
    CommonModule,
    BaseSheetComponent,
    VerifiedChartComponent,
    H2ColorChipComponent,
    H2CompositionChartComponent,
    RfnboChipComponent,
    PrettyEnumPipe,
  ],
  templateUrl: './h2-batch-card.component.html',
})
export class H2BatchCardComponent {
  batch = input.required<HydrogenBatchDto>();
}
