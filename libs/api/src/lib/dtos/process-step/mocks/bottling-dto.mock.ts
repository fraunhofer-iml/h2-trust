import { BottlingDto } from '../bottling.dto';

export const BottlingDtoMock = <BottlingDto[]>[
  <BottlingDto>{
    amount: 1,
    color: 'GREEN',
    recipient: 'company-recipient-1',
    filledAt: '2025-04-07T00:00:00.000Z',
    recordedBy: 'user-id-1',
    hydrogenStorageUnit: 'hydrogen-storage-unit-1',
    fileDescription: 'Certificate for green hydrogen production',
  },
];
