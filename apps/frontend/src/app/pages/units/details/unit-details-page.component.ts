/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { UnitDto } from '@h2-trust/contracts/dtos';
import { MeasurementUnit, UnitType } from '@h2-trust/domain';
import { ErrorCardComponent } from '../../../layout/error-card/error-card.component';
import { InfoTooltipComponent } from '../../../layout/info-tooltip/info-tooltip.component';
import { LoadingCardComponent } from '../../../layout/loading-card/loading-card.component';
import { UnitCardComponent } from '../../../layout/unit-card/unit-card.component';
import { RFNBO_CRITERIA } from '../../../shared/constants/rfnbo-criteria';
import { BoolPipe } from '../../../shared/pipes/bool-pipe';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { QueryKeyPrefix } from '../../../shared/queries/shared-query-keys';
import { UnitsService } from '../../../shared/services/units/units.service';
import {
  isHydrogenProductionUnitDetails,
  isHydrogenStorageUnitDetails,
  isPowerProductionUnitDetails,
} from '../../../shared/util/unit-type-guards';
import { UnitActionsComponent } from './shared/unit-actions/unit-actions.component';
import { UnitDetailsComponent } from './shared/unit-details/unit-details.component';
import { H2TrustRoutes } from '../../../shared/constants/routes';

@Component({
  selector: 'app-unit-details-page',
  imports: [
    CommonModule,
    UnitPipe,
    BoolPipe,
    InfoTooltipComponent,
    UnitDetailsComponent,
    RouterModule,
    ErrorCardComponent,
    LoadingCardComponent,
    UnitActionsComponent,
    EnumPipe,
    UnitCardComponent,
  ],
  templateUrl: './unit-details-page.component.html',
})
export class UnitDetailsPageComponent {
  protected readonly MeasurementUnit = MeasurementUnit;
  protected readonly RFNBO_CRITERIA = RFNBO_CRITERIA;
  protected readonly UnitType = UnitType;
  protected readonly isHydrogenProductionUnitDetails = isHydrogenProductionUnitDetails;
  protected readonly isHydrogenStorageUnitDetails = isHydrogenStorageUnitDetails;
  protected readonly isPowerProductionUnitDetails = isPowerProductionUnitDetails;
  protected readonly H2TrustRoutes = H2TrustRoutes;
  readonly id = input<string>('');

  private readonly unitsService = inject(UnitsService);
  private readonly queryClient = inject(QueryClient);

  readonly unitQuery = injectQuery(() => ({
    queryKey: [QueryKeyPrefix.UNITS, this.id()],
    queryFn: (): Promise<UnitDto> => this.unitsService.getUnitById(this.id()),
    enabled: !!this.id(),
  }));

  readonly onUnitStatusChange = () => this.queryClient.invalidateQueries({ queryKey: [QueryKeyPrefix.UNITS] });
}
