import { toast } from 'ngx-sonner';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import {
  HydrogenProductionUnitCreateDto,
  HydrogenStorageUnitCreateDto,
  PowerProductionUnitCreateDto,
} from '@h2-trust/api';
import { UnitsService } from '../../shared/services/units/units.service';

@Injectable({
  providedIn: 'root',
})
export class UnitQueryService {
  private unitsService = inject(UnitsService);
  private router = inject(Router);

  hydrogenStorageQuery = injectQuery(() => ({
    queryKey: ['h2-storage'],
    queryFn: () => this.unitsService.getHydrogenStorageUnits(),
  }));

  powerProductionQuery = injectQuery(() => ({
    queryKey: ['power-production'],
    queryFn: async () => this.unitsService.getPowerProductionUnits(),
  }));

  hydrogenProductionQuery = injectQuery(() => ({
    queryKey: ['h2-production'],
    queryFn: async () => this.unitsService.getHydrogenProductionUnits(),
  }));

  createHydrogenStorageUnitMutation = injectMutation(() => ({
    mutationFn: (dto: HydrogenStorageUnitCreateDto) => this.unitsService.createHydrogenStorageUnit(dto),
    onError: (e) => toast.error(e.message),
    onSuccess: () => {
      this.router.navigateByUrl('units/hydrogen-storage');
      toast.success('Successfully created.');
    },
  }));

  createPowerProductionUnitMutation = injectMutation(() => ({
    mutationFn: (dto: PowerProductionUnitCreateDto) => this.unitsService.createPowerProductionUnit(dto),
    onError: (e) => toast.error(e.message),
    onSuccess: () => {
      this.router.navigateByUrl('units/power-production');
      toast.success('Successfully created.');
    },
  }));

  createHydrogenProductionUnitMutation = injectMutation(() => ({
    mutationFn: (dto: HydrogenProductionUnitCreateDto) => this.unitsService.createHydrogenProductionUnit(dto),
    onError: (e) => toast.error(e.message),
    onSuccess: () => {
      this.router.navigateByUrl('units/hydrogen-production');
      toast.success('Successfully created.');
    },
  }));
}
