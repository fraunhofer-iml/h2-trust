import { ProcessStepDbType } from '..';
import { AddressSeed, BatchesSeed, CompaniesSeed, ProcessStepsSeed, UnitsSeed, UsersSeed } from '../../../seed';

export const ProcessStepDbTypeMock = <ProcessStepDbType[]>[
  {
    ...ProcessStepsSeed[1],
    batch: {
      ...BatchesSeed[1],
      owner: {
        ...CompaniesSeed[1],
        address: AddressSeed[1],
      },
      predecessors: [],
      successors: [],
    },
    executedBy: {
      ...UnitsSeed[4],
      address: AddressSeed[1],
      company: {
        ...CompaniesSeed[1],
        address: AddressSeed[1],
        hydrogenApprovals: [],
      },
    },
    recordedBy: UsersSeed[1],
    documents: [],
  },
];
