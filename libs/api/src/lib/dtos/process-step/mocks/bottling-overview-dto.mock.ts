import { BottlingOverviewDto } from '../bottling-overview.dto';

export const BottlingOverviewDtoMock = <BottlingOverviewDto[]>[
  <BottlingOverviewDto>{
    id: 'bottling-batch-1',
    filledAt: new Date('2025-04-07T08:48:00.000Z'),
    filledAmount: 100,
    owner: 'company-hydrogen-1',
    color: 'GREEN',
  },
];
