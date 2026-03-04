import { Component, inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MeasurementUnit } from '@h2-trust/domain';
import { ICONS } from '../../../shared/constants/icons';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { ProductionService } from '../../../shared/services/production/production.service';

@Component({
  templateUrl: './production-statistics.component.html',
  selector: 'app-production-statistics',
  imports: [UnitPipe],
})
export class ProductionStatisticsComponent {
  readonly MeasurementUnit = MeasurementUnit;
  readonly ICONS = ICONS.UNITS;

  productionService = inject(ProductionService);

  productionQuery = injectQuery(() => ({
    queryKey: ['production-statistics'],
    queryFn: () => this.productionService.getStatistics(),
  }));
}
