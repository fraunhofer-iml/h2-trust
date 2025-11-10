import { FINANCIAL_SUPPORT_INFO } from 'apps/frontend/src/app/shared/constants/financial-support-info';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { RedComplianceDto } from '@h2-trust/api';

@Component({
  selector: 'app-red-compliance',
  imports: [CommonModule, MatTooltip],
  templateUrl: './red-compliance.component.html',
})
export class RedComplianceComponent {
  protected readonly FFINANCIAL_SUPPORT_INFOI = FINANCIAL_SUPPORT_INFO;
  redCompliance = input<RedComplianceDto>();
  showOverlay = false;

  private previousTimeout: ReturnType<typeof setTimeout> | undefined;
  readonly closing$ = new Subject<boolean>();

  onCLick() {
    this.showOverlay = !this.showOverlay;
  }

  close() {
    this.closing$.next(true);
    if (this.previousTimeout) {
      clearTimeout(this.previousTimeout);
    }
    this.previousTimeout = setTimeout(() => {
      this.showOverlay = false;
    }, 300);
  }
}
