import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { PpaRequestDto } from '@h2-trust/api';
import { PowerAccessApprovalStatus, PpaRequestRole } from '@h2-trust/domain';
import {
  hydrogenProductionUnitsQueryOptions,
  powerProductionUnitsQueryOptions,
} from '../../../shared/queries/hydrogen-production-units.query';
import { PowerAccessApprovalService } from '../../../shared/services/power-access-approvals/power-access-approvals.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { PpaRequestsListComponent } from './ppa-requests-list/ppa-requests-list.component';

@Component({
  selector: 'app-ppa-requests',
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    MatTabsModule,
    PpaRequestsListComponent,
  ],
  templateUrl: './ppa-requests.component.html',
})
export class PpaRequestsComponent {
  protected readonly PowerAccessApprovalStatus = PowerAccessApprovalStatus;
  protected readonly PpaRequestRole = PpaRequestRole;

  protected readonly unitsService = inject(UnitsService);
  protected readonly ppaService = inject(PowerAccessApprovalService);

  hydrogenProductionUnitsQuery = injectQuery(() => hydrogenProductionUnitsQueryOptions(this.unitsService));
  powerProductionUnitsQuery = injectQuery(() => powerProductionUnitsQueryOptions(this.unitsService));

  ppaRequestsSentQuery = injectQuery(() => ({
    queryKey: ['ppa-requests', PpaRequestRole.SENDER],
    queryFn: async () => {
      const requests = await this.ppaService.getPpaRequests(PpaRequestRole.SENDER);
      return this.mapByStatus(requests);
    },
  }));

  ppaRequestsReceivedQuery = injectQuery(() => ({
    queryKey: ['ppa-requests', PpaRequestRole.RECEIVER],
    queryFn: async () => {
      const requests = await this.ppaService.getPpaRequests(PpaRequestRole.RECEIVER);
      return this.mapByStatus(requests);
    },
  }));

  mapByStatus(requests: PpaRequestDto[]): { pending: PpaRequestDto[]; closed: PpaRequestDto[] } {
    const result: { pending: PpaRequestDto[]; closed: PpaRequestDto[] } = { pending: [], closed: [] };
    requests.map((val) =>
      val.status === PowerAccessApprovalStatus.PENDING ? result.pending.push(val) : result.closed.push(val),
    );
    return result;
  }

  isPowerProducer = computed(() => (this.powerProductionUnitsQuery.data()?.length ?? 0) > 0);
  isHydrogenProducer = computed(() => (this.hydrogenProductionUnitsQuery.data()?.length ?? 0) > 0);

  showCommentInput = false;

  requestsSentPending = [];
  requestsSent = [];
}
