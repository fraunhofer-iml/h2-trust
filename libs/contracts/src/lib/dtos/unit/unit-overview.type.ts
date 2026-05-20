import { HydrogenProductionOverviewDto } from './hydrogen-production-overview.dto';
import { HydrogenStorageOverviewDto } from './hydrogen-storage-overview.dto';
import { PowerProductionOverviewDto } from './power-production-overview.dto';

export type UnitOverviewDto = HydrogenProductionOverviewDto | PowerProductionOverviewDto | HydrogenStorageOverviewDto;
