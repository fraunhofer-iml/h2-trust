import { BaseUnitDbType } from '..';
import { AddressSeed, CompaniesSeed, PowerAccessApprovalsSeed, UnitsSeed } from '../../../seed';

export const BaseUnitDbTypeMock = <BaseUnitDbType[]>[
  {
    ...UnitsSeed[0],
    address: AddressSeed[0],
    company: {
      ...CompaniesSeed[0],
      hydrogenApprovals: PowerAccessApprovalsSeed.map((approval) => ({
        ...approval,
        powerProducer: CompaniesSeed[0],
      })),
    },
  },
];
