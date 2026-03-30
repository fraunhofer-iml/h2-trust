import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, Signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { PowerAccessApprovalStatus, PpaRequestRole } from '@h2-trust/domain';
import {
  hydrogenProductionUnitsQueryOptions,
  powerProductionUnitsQueryOptions,
} from '../../../shared/queries/hydrogen-production-units.query';
import { PowerAccessApprovalService } from '../../../shared/services/power-access-approvals/power-access-approvals.service';
import { UnitsService } from '../../../shared/services/units/units.service';

interface RequestLabels {
  heading: string;
  description: Record<PowerAccessApprovalStatus, string>;
}

@Component({
  selector: 'app-ppa-requests-overview',
  imports: [CommonModule, MatDividerModule],
  templateUrl: './ppa-requests-overview.component.html',
})
export class PpaRequestsOverviewComponent {
  role = input.required<PpaRequestRole>();
  protected PowerAccessApprovalStatus = PowerAccessApprovalStatus;

  protected readonly ppaService = inject(PowerAccessApprovalService);
  protected readonly unitsService = inject(UnitsService);

  hydrogenProductionUnitsQuery = injectQuery(() => hydrogenProductionUnitsQueryOptions(this.unitsService));
  powerProductionUnitsQuery = injectQuery(() => powerProductionUnitsQueryOptions(this.unitsService));

  ppaRequestsQuery = injectQuery(() => ({
    queryKey: ['ppa-requests', this.role()],
    queryFn: async () => {
      const requests = await this.ppaService.getPpaRequests(this.role());
      const statistics = requests.reduce(
        (acc, item) => {
          acc[item.status]++;
          return acc;
        },
        {
          [PowerAccessApprovalStatus.APPROVED]: 0,
          [PowerAccessApprovalStatus.REJECTED]: 0,
          [PowerAccessApprovalStatus.PENDING]: 0,
        },
      );

      return statistics;
    },
  }));

  isPowerProducer = computed(() => (this.powerProductionUnitsQuery.data()?.length ?? 0) > 0);
  isHydrogenProducer = computed(() => (this.hydrogenProductionUnitsQuery.data()?.length ?? 0) > 0);

  labels: Signal<RequestLabels> = computed(() => {
    const labelsReceiver: RequestLabels = {
      heading: 'RECEIVED',
      description: {
        [PowerAccessApprovalStatus.APPROVED]: 'Requests you have approved.',
        [PowerAccessApprovalStatus.REJECTED]: 'Requests you have declined.',
        [PowerAccessApprovalStatus.PENDING]: 'Requests awaiting your review.',
      },
    };

    const labelsSender: RequestLabels = {
      heading: 'SENT',
      description: {
        [PowerAccessApprovalStatus.APPROVED]: 'Requests that have been approved.',
        [PowerAccessApprovalStatus.REJECTED]: 'Requests that have been declined.',
        [PowerAccessApprovalStatus.PENDING]: 'Requests awaiting response.',
      },
    };

    return this.role() === PpaRequestRole.RECEIVER ? labelsReceiver : labelsSender;
  });
}
