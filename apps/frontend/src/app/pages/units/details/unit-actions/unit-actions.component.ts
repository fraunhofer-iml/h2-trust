import { UnitsService } from 'apps/frontend/src/app/shared/services/units/units.service';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { injectMutation } from '@tanstack/angular-query-experimental';

@Component({
  selector: 'app-unit-actions',
  imports: [MatButtonModule, CommonModule, RouterModule],
  templateUrl: './unit-actions.component.html',
})
export class UnitActionsComponent {
  unit = input.required<{ id: string; active: boolean }>();

  unitsService = inject(UnitsService);
  router = inject(Router);

  mutation = injectMutation(() => ({
    mutationFn: (active: boolean) => this.unitsService.updateActive(this.unit().id, active),
    onSuccess: () => {
      location.reload();
    },
    onError: () => toast.error('Failed to update unit status.'),
    enabled: this.unit().active,
  }));
}
