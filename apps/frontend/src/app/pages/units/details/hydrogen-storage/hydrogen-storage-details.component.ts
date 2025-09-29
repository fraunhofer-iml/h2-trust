import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { HydrogenStorageUnitDto } from '@h2-trust/api';

@Component({
  selector: 'app-hydrogen-storage-details',
  imports: [CommonModule],
  templateUrl: './hydrogen-storage-details.component.html',
})
export class HydrogenStorageDetailsComponent {
  unit = input.required<HydrogenStorageUnitDto>();
}
