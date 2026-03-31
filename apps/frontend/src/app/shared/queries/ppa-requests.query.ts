import { PpaRequestRole } from '@h2-trust/domain';
import { PowerAccessApprovalService } from '../services/power-access-approvals/power-access-approvals.service';
import { QUERY_KEYS } from './shared-query-keys';

export const ppaRequestsQueryOptions = (unitsService: PowerAccessApprovalService, role: PpaRequestRole) => ({
  queryKey: [...QUERY_KEYS.PPA_REQUESTS, role],
  queryFn: () => unitsService.getPpaRequests(role),
  staleTime: 60 * 1000,
});
