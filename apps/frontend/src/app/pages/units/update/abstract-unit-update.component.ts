/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpErrorResponse } from '@angular/common/http';
import { inject, InputSignal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { QueryKeyPrefix } from '../../../shared/queries/shared-query-keys';
import { UnitsService } from '../../../shared/services/units/units.service';
import { toastQueryError } from '../../../shared/util/query-error-handler';
import { newUnitForm, UnitFormGroup } from '../forms/forms';

export abstract class AbstractUnitUpdateComponent<TUnitDto, TUnitInputDto> {
  unitForm: FormGroup<UnitFormGroup> = newUnitForm();

  protected readonly unitsService = inject(UnitsService);
  protected readonly router = inject(Router);
  protected readonly queryClient = inject(QueryClient);

  abstract id: InputSignal<string | undefined>;

  protected abstract readonly queryPrefix: QueryKeyPrefix;

  protected abstract fetchUnit(id: string): Promise<TUnitDto>;
  protected abstract updateUnit(id: string, dto: TUnitInputDto): Promise<unknown>;
  protected abstract setFormData(unit: TUnitDto): void;
  protected abstract buildDto(): TUnitInputDto;
  protected abstract navigateToDetailsView(): void;

  unitQuery = injectQuery(() => ({
    queryKey: [this.queryPrefix, this.id()],
    queryFn: async () => {
      const unit = await this.fetchUnit(this.id() ?? '');
      this.setFormData(unit);
      return unit;
    },

    enabled: !!this.id(),
  }));

  unitMutation = injectMutation(() => ({
    mutationFn: (dto: TUnitInputDto) => this.updateUnit(this.id() ?? '', dto),
    onSuccess: () => this.onSuccess(),
    onError: (err: HttpErrorResponse) => toastQueryError(err),
  }));

  onSave() {
    const dto = this.buildDto();
    this.unitMutation.mutate(dto);
  }

  private onSuccess() {
    this.queryClient.invalidateQueries({ queryKey: [this.queryPrefix] });
    this.navigateToDetailsView();
  }
}
