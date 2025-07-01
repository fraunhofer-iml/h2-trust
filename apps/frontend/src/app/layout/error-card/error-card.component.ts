import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-card',
  imports: [CommonModule, MatIconModule],
  templateUrl: './error-card.component.html',
})
export class ErrorCardComponent {
  message = input<string>();
}
