import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { UnitType } from '@h2-trust/domain';

@Component({
  selector: 'app-unit-status-chip',
  imports: [CommonModule],
  template: `
    <div
      class="flex w-fit flex-row items-center gap-2 rounded-lg border bg-white px-2 text-sm"
      [ngClass]="{
        'text-primary-500': unit().unitType === UnitType.POWER_PRODUCTION,
        'text-secondary-500': unit().unitType === UnitType.HYDROGEN_PRODUCTION,
        'text-neutral-500': unit().unitType === UnitType.HYDROGEN_STORAGE,
      }"
    >
      <span
        class="material-symbols-outlined text-lg"
        [ngClass]="{
          'text-primary-400': unit().unitType === UnitType.POWER_PRODUCTION,
          'text-secondary-400': unit().unitType === UnitType.HYDROGEN_PRODUCTION,
          'text-neutral-400': unit().unitType === UnitType.HYDROGEN_STORAGE,
          'animate-spin': unit().active,
        }"
      >
        {{ unit().active ? 'atr' : 'bedtime' }}
      </span>
      {{ unit().active ? 'Active' : 'Inactive' }}
    </div>
  `,
})
export class UnitStatusChipComponent {
  unit = input.required<{ unitType: UnitType; active: boolean }>();
  protected readonly UnitType = UnitType;
}
