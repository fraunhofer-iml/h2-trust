import { CompanyDtoMock } from '../../company';
import { ProcessedCsvDto } from '../processed-csv.dto';

export const ProcessedCsvDtoMock = <ProcessedCsvDto[]>[
  {
    id: '550e8400-e29b-41d4-a716-44665544215',
    csvContentType: 'HYDROGEN',
    startedAt: new Date(2026, 1, 1),
    endedAt: new Date(2026, 1, 4),
    name: 'Hydrogen Test',
    uploadedBy: CompanyDtoMock[1].name,
    url: 'http://localhost:9000/h2-trust/Sommer_22%20(3).pdf',
    amount: 30,
  },
  {
    id: '550e8400-446655440000e29b-41d4-a716',
    csvContentType: 'HYDROGEN',
    startedAt: new Date(2026, 1, 5),
    endedAt: new Date(2026, 1, 12),
    name: 'Hydrogen Test',
    uploadedBy: CompanyDtoMock[1].name,
    url: 'http://localhost:9000/h2-trust/Sommer_22%20(3).pdf',
    amount: 415,
  },
  {
    id: '32117450e8400-441745600e29b-41d4-a716',
    csvContentType: 'POWER',
    startedAt: new Date(2026, 1, 1),
    endedAt: new Date(2026, 1, 3),
    name: 'Hydrogen Test',
    uploadedBy: CompanyDtoMock[0].name,
    url: '',
    amount: 415,
  },
  {
    id: '988e8400-48548418746414455b-41d4-a716',
    csvContentType: 'POWER',
    startedAt: new Date(2026, 1, 6),
    endedAt: new Date(2026, 1, 13),
    name: 'Hydrogen Test',
    uploadedBy: CompanyDtoMock[0].name,
    url: '',
    amount: 415,
  },
];
