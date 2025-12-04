import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';

@Component({
  selector: 'app-info-tooltip',
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './info-tooltip.component.html',
})
export class InfoTooltipComponent {
  tooltip = input.required<string>();
  style = input<'primary' | 'neutral'>('neutral');
  position = input<TooltipPosition>('below');
}
