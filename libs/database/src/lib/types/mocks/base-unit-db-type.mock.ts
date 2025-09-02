import { BaseUnitDbType } from '..';
import { AddressSeed, CompanySeed, PowerAccessApprovalSeed, UnitSeed } from '../../../seed';

export const BaseUnitDbTypeMock = <BaseUnitDbType[]>[
  {
    ...UnitSeed[0],
    address: AddressSeed[0],
    owner: {
      ...CompanySeed[0],
      hydrogenApprovals: PowerAccessApprovalSeed.map((approval) => ({
        ...approval,
        powerProducer: CompanySeed[0],
      })),
    },
  },
];
