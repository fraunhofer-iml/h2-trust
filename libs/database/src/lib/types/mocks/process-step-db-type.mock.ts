import { ProcessStepDbType } from '..';
import { AddressSeed, BatchSeed, CompanySeed, ProcessStepSeed, UnitSeed, UserSeed } from '../../../seed';

export const ProcessStepDbTypeMock = <ProcessStepDbType[]>[
  {
    ...ProcessStepSeed[1],
    batch: {
      ...BatchSeed[1],
      owner: {
        ...CompanySeed[1],
        address: AddressSeed[1],
      },
      predecessors: [],
      successors: [],
    },
    executedBy: {
      ...UnitSeed[4],
      address: AddressSeed[1],
      company: {
        ...CompanySeed[1],
        address: AddressSeed[1],
        hydrogenApprovals: [],
      },
    },
    recordedBy: UserSeed[1],
    documents: [],
  },
];
