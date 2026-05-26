/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionOverviewDto } from './hydrogen-production-overview.dto';
import { HydrogenProductionUnitDto } from './hydrogen-production-unit.dto';
import { HydrogenStorageOverviewDto } from './hydrogen-storage-overview.dto';
import { HydrogenStorageUnitDto } from './hydrogen-storage-unit.dto';
import { PowerProductionOverviewDto } from './power-production-overview.dto';
import { PowerProductionUnitDto } from './power-production-unit.dto';

export type UnitOverviewDto = HydrogenProductionOverviewDto | PowerProductionOverviewDto | HydrogenStorageOverviewDto;
export type UnitDto = HydrogenProductionUnitDto | PowerProductionUnitDto | HydrogenStorageUnitDto;
