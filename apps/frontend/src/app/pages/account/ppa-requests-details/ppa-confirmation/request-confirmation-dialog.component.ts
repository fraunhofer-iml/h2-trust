/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { QUERY_KEYS } from 'apps/frontend/src/app/shared/queries/shared-query-keys';
import { powerProductionUnitsQueryOptions } from 'apps/frontend/src/app/shared/queries/units.query';
import { PowerAccessApprovalService } from 'apps/frontend/src/app/shared/services/power-access-approvals/power-access-approvals.service';
import { UnitsService } from 'apps/frontend/src/app/shared/services/units/units.service';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { PowerProductionOverviewDto, PpaRequestDecisionDto, PpaRequestDto } from '@h2-trust/contracts';
import { PowerAccessApprovalStatus, PpaRequestRole } from '@h2-trust/domain';
import { PrettyEnumPipe } from '../../../../shared/pipes/format-enum.pipe';

@Component({
  selector: 'app-request-confirmation-dialog',
  imports: [
    MatDialogModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    MatDialogTitle,
    MatDialogActions,
    ReactiveFormsModule,
    PrettyEnumPipe,
    CommonModule,
  ],
  templateUrl: './request-confirmation-dialog.component.html',
})
export class RequestConfirmationDialogComponent {
  protected readonly PowerAccessApprovalStatus = PowerAccessApprovalStatus;

  readonly dialogRef = inject(MatDialogRef<RequestConfirmationDialogComponent>);
  readonly data = inject<{
    status: PowerAccessApprovalStatus.APPROVED | PowerAccessApprovalStatus.REJECTED;
    request: PpaRequestDto;
  }>(MAT_DIALOG_DATA);
  private ppaService = inject(PowerAccessApprovalService);
  private unitsService = inject(UnitsService);
  private queryClient = inject(QueryClient);

  form = new FormGroup<{
    comment: FormControl<string | null>;
    unit: FormControl<null | PowerProductionOverviewDto>;
  }>({
    comment: new FormControl<string | null>(''),
    unit: new FormControl<PowerProductionOverviewDto | null>(null),
  });

  unitsQuery = injectQuery(() => powerProductionUnitsQueryOptions(this.unitsService));

  confirmationMutation = injectMutation(() => ({
    mutationFn: (dto: PpaRequestDecisionDto) => this.ppaService.decidePpaRequest(this.data.request.id, dto),
    onError: () =>
      toast.error(
        `Failed to ${this.data.status === PowerAccessApprovalStatus.REJECTED ? 'reject' : 'approve'} Request`,
      ),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.PPA_REQUESTS, PpaRequestRole.RECEIVER] });
      toast.success(`Request ${this.data.status.toLowerCase()}.`);
    },
  }));

  constructor() {
    if (this.data.status === PowerAccessApprovalStatus.APPROVED)
      this.form.controls.unit.setValidators(Validators.required);
  }

  close(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    const val = this.form.value;

    if (this.data.status === PowerAccessApprovalStatus.APPROVED && !val.unit) return;

    const dto: PpaRequestDecisionDto = {
      decision: this.data.status,
      comment: val.comment,
      powerProductionUnitId: val.unit?.id,
    } as PpaRequestDecisionDto;

    this.confirmationMutation.mutate(dto);
    this.close();
  }
}
