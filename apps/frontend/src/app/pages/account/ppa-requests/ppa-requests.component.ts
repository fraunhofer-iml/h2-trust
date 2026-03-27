import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { PpaRequestDto } from '@h2-trust/api';
import { PowerAccessApprovalStatus, PpaRequestRole } from '@h2-trust/domain';
import {
  hydrogenProductionUnitsQueryOptions,
  powerProductionUnitsQueryOptions,
} from '../../../shared/queries/hydrogen-production-units.query';
import { PowerAccessApprovalService } from '../../../shared/services/power-access-approvals/power-access-approvals.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { PpaRequestCardComponent } from './card/ppa-request-card.component';

@Component({
  selector: 'app-ppa-requests',
  imports: [CommonModule, MatDivider, MatButtonModule, MatFormFieldModule, MatInputModule, PpaRequestCardComponent],
  templateUrl: './ppa-requests.component.html',
})
export class PpaRequestsComponent {
  protected readonly PowerAccessApprovalStatus = PowerAccessApprovalStatus;
  protected readonly PpaRequestRole = PpaRequestRole;

  protected readonly unitsService = inject(UnitsService);
  protected readonly ppaService = inject(PowerAccessApprovalService);

  hydrogenProductionUnitsQuery = injectQuery(() => hydrogenProductionUnitsQueryOptions(this.unitsService));
  powerProductionUnitsQuery = injectQuery(() => powerProductionUnitsQueryOptions(this.unitsService));

  ppaRequestsQuery = injectQuery(() => ({
    queryKey: ['ppa-requests'],
    queryFn: () => this.ppaService.getPpaRequests(),
  }));

  isPowerProducer = computed(() => (this.powerProductionUnitsQuery.data()?.length ?? 0) > 0);
  isHydrogenProducer = computed(() => (this.hydrogenProductionUnitsQuery.data()?.length ?? 0) > 0);

  requestsReceived = computed(() => {
    const sortedRequests: { pending: PpaRequestDto[]; closed: PpaRequestDto[] } = { pending: [], closed: [] };
    (this.ppaRequestsQuery.data() ?? []).map((val) =>
      val.status === PowerAccessApprovalStatus.PENDING
        ? sortedRequests.pending.push(val)
        : sortedRequests.closed.push(val),
    );
    return sortedRequests;
  });

  showCommentInput = false;

  requestsSentPending = [];
  requestsSent = [];
}
