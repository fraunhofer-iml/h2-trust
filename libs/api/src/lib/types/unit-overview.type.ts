import { HydrogenProductionOverviewDto, HydrogenStorageOverviewDto, PowerProductionOverviewDto } from '../dtos';

export type UnitOverviewDto = PowerProductionOverviewDto | HydrogenProductionOverviewDto | HydrogenStorageOverviewDto;
