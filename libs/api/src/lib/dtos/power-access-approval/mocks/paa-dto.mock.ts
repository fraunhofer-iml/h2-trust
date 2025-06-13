import { PowerAccessApprovalStatus } from '../../../enums';
import { CompanyDtoMock } from '../../company';
import { PowerProductionUnitOverviewDtoMock } from '../../unit/mock/power-production-unit-overview-dto.mock';
import { PowerAccessApprovalDto } from '../power-access-approval.dto';

export const PowerAccessApprovalDtoMock = <PowerAccessApprovalDto[]>[
  <PowerAccessApprovalDto>{
    id: 'paa-1',
    hydrogenProducer: CompanyDtoMock[1],
    powerProducer: CompanyDtoMock[0],
    powerProductionUnit: PowerProductionUnitOverviewDtoMock[0],
    status: PowerAccessApprovalStatus.APPROVED,
    energySource: 'WIND_ENERGY',
  },
];
