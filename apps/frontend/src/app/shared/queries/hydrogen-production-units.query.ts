import { UnitsService } from '../services/units/units.service';
import { QUERY_KEYS } from './shared-query-keys';

export const hydrogenProductionUnitsQueryOptions = (unitsService: UnitsService) => ({
  queryKey: QUERY_KEYS.HYDROGEN_PRODUCTION_UNITS,
  queryFn: () => unitsService.getHydrogenProductionUnits(),
  staleTime: 60 * 1000,
});
