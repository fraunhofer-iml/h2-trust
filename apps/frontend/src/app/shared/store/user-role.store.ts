import { computed, inject, Injectable } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { hydrogenProductionUnitsQueryOptions, powerProductionUnitsQueryOptions } from '../queries/units.query';
import { UnitsService } from '../services/units/units.service';

@Injectable({
  providedIn: 'root',
})
export class UserRolesStore {
  private unitsService = inject(UnitsService);

  powerUnitsQuery = injectQuery(() => powerProductionUnitsQueryOptions(this.unitsService));

  hydrogenUnitsQuery = injectQuery(() => hydrogenProductionUnitsQueryOptions(this.unitsService));

  isPowerProducer = computed(() => (this.powerUnitsQuery.data()?.length ?? 0) > 0);

  isHydrogenProducer = computed(() => (this.hydrogenUnitsQuery.data()?.length ?? 0) > 0);
}
