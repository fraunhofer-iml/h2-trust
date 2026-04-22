/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanyDtoMock } from '../../company';
import { ProcessedCsvDto } from '../processed-csv.dto';

export const ProcessedCsvDtoMock = <ProcessedCsvDto[]>[
  {
    id: '550e8400-e29b-41d4-a716-44665544215',
    csvContentType: 'HYDROGEN',
    startedAt: new Date(2026, 1, 1),
    endedAt: new Date(2026, 1, 4),
    name: 'H2_Production_2025.csv',
    uploadedBy: CompanyDtoMock[1].name,
    url: '',
    amount: 30,
  },
  {
    id: '550e8400-446655440000e29b-41d4-a716',
    csvContentType: 'HYDROGEN',
    startedAt: new Date(2026, 1, 5),
    endedAt: new Date(2026, 1, 12),
    name: 'H2_Production_2026.csv',
    uploadedBy: CompanyDtoMock[1].name,
    url: '',
    amount: 415,
  },
  {
    id: '32117450e8400-441745600e29b-41d4-a716',
    csvContentType: 'POWER',
    startedAt: new Date(2026, 1, 1),
    endedAt: new Date(2026, 1, 3),
    name: 'Power_Production_2025.csv',
    uploadedBy: CompanyDtoMock[0].name,
    url: '',
    amount: 28.6,
  },
  {
    id: '988e8400-48548418746414455b-41d4-a716',
    csvContentType: 'POWER',
    startedAt: new Date(2026, 1, 6),
    endedAt: new Date(2026, 1, 13),
    name: 'Power_Production.csv',
    uploadedBy: CompanyDtoMock[0].name,
    url: '',
    amount: 268.75,
  },
];
