import { ProcessStepDbType } from '..';
import { Addresses, Batches, Companies, ProcessSteps, Units, Users } from '../../../seed';

export const ProcessStepDbTypeMock = <ProcessStepDbType[]>[
  {
    ...ProcessSteps[1],
    batch: {
      ...Batches[1],
      owner: {
        ...Companies[1],
        address: Addresses[1],
      },
      predecessors: [],
      successors: [],
    },
    executedBy: {
      ...Units[1],
      address: Addresses[1],
      company: {
        ...Companies[1],
        address: Addresses[1],
        hydrogenApprovals: [],
      },
    },
    recordedBy: Users[1],
    documents: [],
  },
];
