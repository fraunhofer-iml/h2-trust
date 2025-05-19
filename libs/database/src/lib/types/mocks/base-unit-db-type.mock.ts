import { BaseUnitDbType } from '..';
import { Addresses, Companies, PowerAccessApprovals, Units } from '../../../seed';

export const BaseUnitDbTypeMock = <BaseUnitDbType[]>[
  {
    ...Units[0],
    address: Addresses[0],
    company: {
      ...Companies[0],
      hydrogenApprovals: PowerAccessApprovals.map((approval) => ({
        ...approval,
        powerProducer: Companies[0],
      })),
    },
  },
];
