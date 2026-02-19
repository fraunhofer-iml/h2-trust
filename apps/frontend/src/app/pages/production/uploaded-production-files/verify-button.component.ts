import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ProcessedCsvDto } from '@h2-trust/api';
import { ValidationResult } from './validated-file';

@Component({
  selector: 'app-verify-button',
  imports: [MatButtonModule],
  templateUrl: './verify-button.component.html',
})
export class VerifyButtonComponent {
  file = input.required<ProcessedCsvDto>();

  verifying = false;

  verificationEMitter = output<ValidationResult>();

  verify() {
    this.verifying = true;

    this.verificationEMitter.emit({
      status: 'MISMATCHED',
      id: this.file().id,
      tooltip: 'MISMATCHED',
    });
    this.verifying = false;
  }
}
