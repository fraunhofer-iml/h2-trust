/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { UnitsService } from 'apps/frontend/src/app/shared/services/units/units.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-unit-actions',
  imports: [MatButtonModule, CommonModule, RouterModule],
  templateUrl: './unit-actions.component.html',
})
export class UnitActionsComponent {
  unit = input.required<{ id: string; active: boolean }>();

  statusChange = output<void>();

  unitsService = inject(UnitsService);

  mutation = injectMutation(() => ({
    mutationFn: (active: boolean) => this.unitsService.updateActive(this.unit().id, active),
    onSuccess: () => this.statusChange.emit(),
    onError: () => toast.error('Failed to update unit status.'),
  }));
}
