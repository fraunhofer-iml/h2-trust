import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ValidationResult } from '../validated-file';

@Component({
  selector: 'app-verification-details',
  imports: [CommonModule],
  templateUrl: './verification-details.component.html',
})
export class VerificationDetailsComponent {
  result = input<ValidationResult>();
}
