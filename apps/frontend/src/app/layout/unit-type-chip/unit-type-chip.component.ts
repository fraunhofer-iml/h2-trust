import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { UnitType } from '@h2-trust/api';
import { PrettyEnumPipe } from '../../shared/pipes/format-enum.pipe';

@Component({
  selector: 'app-unit-type-chip',
  imports: [CommonModule, PrettyEnumPipe],
  templateUrl: './unit-type-chip.component.html',
})
export class UnitTypeChipComponent {
  unitType = input<string>('');

  getIcon() {
    switch (this.unitType()) {
      case UnitType.HYDROGEN_PRODUCTION:
        return 'settings';
      case UnitType.POWER_PRODUCTION:
        return 'electric_bolt';
      case UnitType.HYDROGEN_STORAGE:
        return 'propane';
      default:
        return 'block';
    }
  }
}
