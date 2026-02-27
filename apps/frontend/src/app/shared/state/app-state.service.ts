import { toast } from 'ngx-sonner';
import { inject, Injectable, signal } from '@angular/core';
import { HydrogenProductionOverviewDto } from '@h2-trust/api';
import { UnitsService } from '../services/units/units.service';

@Injectable()
export class AppStateService {
  unitsService = inject(UnitsService);

  private readonly hydrogenProductionUnits$ = signal<HydrogenProductionOverviewDto[]>([]);

  private loaded = signal(false);

  get hydrogenProductionUnits() {
    return this.hydrogenProductionUnits$;
  }

  async ensureLoaded() {
    if (this.loaded()) {
      return;
    }

    try {
      const units = await this.unitsService.getHydrogenProductionUnits();
      this.setUnits(units);
      this.loaded.set(true);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  setUnits(units: HydrogenProductionOverviewDto[]) {
    this.hydrogenProductionUnits$.set(units);
  }
}
