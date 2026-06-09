/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenBottlingOverviewDto } from './hydrogen-bottling-overview.dto';
import { HydrogenBottlingUnitDto } from './hydrogen-bottling-unit.dto';
import { HydrogenCompressorOverviewDto } from './hydrogen-compressor-overview.dto';
import { HydrogenCompressorUnitDto } from './hydrogen-compressor-unit.dto';
import { HydrogenEndUseOverviewDto } from './hydrogen-end-use-overview.dto';
import { HydrogenEndUseUnitDto } from './hydrogen-end-use-unit.dto';
import { HydrogenProductionOverviewDto } from './hydrogen-production-overview.dto';
import { HydrogenProductionUnitDto } from './hydrogen-production-unit.dto';
import { HydrogenStorageOverviewDto } from './hydrogen-storage-overview.dto';
import { HydrogenStorageUnitDto } from './hydrogen-storage-unit.dto';
import { HydrogenTransportOverviewDto } from './hydrogen-transport-overview.dto';
import { HydrogenTransportUnitDto } from './hydrogen-transport-unit.dto';
import { PowerProductionOverviewDto } from './power-production-overview.dto';
import { PowerProductionUnitDto } from './power-production-unit.dto';

export type UnitOverviewDto =
  | HydrogenProductionOverviewDto
  | PowerProductionOverviewDto
  | HydrogenStorageOverviewDto
  | HydrogenTransportOverviewDto
  | HydrogenBottlingOverviewDto
  | HydrogenCompressorOverviewDto
  | HydrogenEndUseOverviewDto;

export type UnitDto =
  | HydrogenProductionUnitDto
  | PowerProductionUnitDto
  | HydrogenStorageUnitDto
  | HydrogenTransportUnitDto
  | HydrogenBottlingUnitDto
  | HydrogenCompressorUnitDto
  | HydrogenEndUseUnitDto;
