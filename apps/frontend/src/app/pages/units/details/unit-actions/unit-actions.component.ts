import { UnitsService } from 'apps/frontend/src/app/shared/services/units/units.service';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { injectMutation } from '@tanstack/angular-query-experimental';

@Component({
  selector: 'app-unit-actions',
  imports: [MatButtonModule, CommonModule],
  templateUrl: './unit-actions.component.html',
})
export class UnitActionsComponent {
  unit = input.required<{ id: string; active: boolean }>();

  unitsService = inject(UnitsService);
  router = inject(Router);

  mutation = injectMutation(() => ({
    mutationFn: () => this.unitsService.deactivate(this.unit().id),
    onSuccess: () => {
      this.router.navigateByUrl('units');
    },
    onError: () => toast.error('Failed to update unit.'),
    enabled: this.unit().active,
  }));
}
