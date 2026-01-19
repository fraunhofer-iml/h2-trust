import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-proof-of-origin-card',
  imports: [CommonModule],
  templateUrl: './proof-of-origin-card.component.html',
})
export class ProofOfOriginCardComponent {
  icon = input.required<string>();
}
