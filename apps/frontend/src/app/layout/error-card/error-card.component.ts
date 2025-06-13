import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ERROR_MESSAGES } from '../../shared/constants/error.messages';

@Component({
  selector: 'app-error-card',
  imports: [CommonModule, MatIconModule],

  templateUrl: './error-card.component.html',
})
export class ErrorCardComponent {
  message = input<ERROR_MESSAGES>();
}
