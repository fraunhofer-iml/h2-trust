import { computed, inject, Injectable, signal } from '@angular/core';
import { HydrogenProductionOverviewDto } from '@h2-trust/api';
import { UnitsService } from '../services/units/units.service';

@Injectable()
export class HydrogenProducerService {
  unitsService = inject(UnitsService);

  private readonly hydrogenProductionUnits$ = signal<HydrogenProductionOverviewDto[]>([]);

  private isHydrogenProducer$ = computed(() => this.hydrogenProductionUnits$().length > 0);

  get isHydrogenProducer() {
    return this.isHydrogenProducer$;
  }

  async loadUnits(): Promise<void> {
    const units = await this.unitsService.getHydrogenProductionUnits();
    this.hydrogenProductionUnits$.set(units);
  }

  setUnits(units: HydrogenProductionOverviewDto[]) {
    this.hydrogenProductionUnits$.set(units);
  }
}
