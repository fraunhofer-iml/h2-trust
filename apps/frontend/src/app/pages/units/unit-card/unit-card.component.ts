import { TitleCasePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { UnitType } from '@h2-trust/domain';
import { ICONS } from '../../../shared/constants/icons';
import { PrettyEnumPipe } from '../../../shared/pipes/format-enum.pipe';

@Component({
  selector: 'app-unit-card',
  imports: [TitleCasePipe, PrettyEnumPipe],
  templateUrl: './unit-card.component.html',
})
export class UnitCardComponent {
  name = input.required<string>();
  unittype = input.required<UnitType>();

  private styles: Record<UnitType, string> = {
    [UnitType.HYDROGEN_PRODUCTION]: 'text-secondary-700  group-hover:bg-secondary-200/80 bg-secondary-100',
    [UnitType.HYDROGEN_STORAGE]: 'text-neutral-700  group-hover:bg-neutral-200/80 bg-neutral-200',
    [UnitType.POWER_PRODUCTION]: 'text-primary-700  group-hover:bg-primary-200/80 bg-primary-100',
  };

  styles$ = computed(() => {
    const type = this.unittype();
    return this.styles[type];
  });

  icon$ = computed(() => {
    const type = this.unittype();
    return ICONS.UNITS[type];
  });
}
