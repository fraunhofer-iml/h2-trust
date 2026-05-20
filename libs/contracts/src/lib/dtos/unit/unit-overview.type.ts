import { HydrogenProductionOverviewDto } from './hydrogen-production-overview.dto';
import { HydrogenProductionUnitDto } from './hydrogen-production-unit.dto';
import { HydrogenStorageOverviewDto } from './hydrogen-storage-overview.dto';
import { HydrogenStorageUnitDto } from './hydrogen-storage-unit.dto';
import { PowerProductionOverviewDto } from './power-production-overview.dto';
import { PowerProductionUnitDto } from './power-production-unit.dto';

export type UnitOverviewDto = HydrogenProductionOverviewDto | PowerProductionOverviewDto | HydrogenStorageOverviewDto;
export type UnitDto = HydrogenProductionUnitDto | PowerProductionUnitDto | HydrogenStorageUnitDto;
