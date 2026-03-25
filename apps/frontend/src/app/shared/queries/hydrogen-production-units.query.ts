import { UnitsService } from '../services/units/units.service';

export const hydrogenProductionUnitsQueryOptions = (unitsService: UnitsService) => ({
  queryKey: ['hydrogen-production-units'] as const,
  queryFn: () => unitsService.getHydrogenProductionUnits(),
  staleTime: 60 * 1000,
});
