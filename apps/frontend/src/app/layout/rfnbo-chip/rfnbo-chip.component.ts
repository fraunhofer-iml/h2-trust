import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rfnbo-chip',
  imports: [CommonModule, MatIconModule],
  templateUrl: './rfnbo-chip.component.html',
})
export class RfnboChipComponent {
  isRFNBOready = input<boolean>(false);
}
