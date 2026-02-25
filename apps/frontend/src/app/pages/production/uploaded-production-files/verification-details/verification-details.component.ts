import { toast } from 'ngx-sonner';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ValidationResult } from '../validated-file';

@Component({
  selector: 'app-verification-details',
  imports: [CommonModule, MatButtonModule, ClipboardModule],
  templateUrl: './verification-details.component.html',
})
export class VerificationDetailsComponent {
  result = input<ValidationResult>();

  onCopied(success: boolean) {
    if (success) {
      toast.success('Transaction hash copied to clipboard!');
    }
  }
}
