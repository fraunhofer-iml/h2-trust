/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { ReadByIdPayload, RedComplianceEntity } from '@h2-trust/amqp';
import { ProvenanceService } from '../provenance/provenance.service';
import { RedCompliancePairingService } from './red-compliance.pairs.service';
import { RedComplianceService } from './red-compliance.service';

describe('RedComplianceService', () => {
  let service: RedComplianceService;
  let provenanceService: ProvenanceService;
  let pairingService: RedCompliancePairingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedComplianceService,
        {
          provide: ProvenanceService,
          useValue: {
            buildProvenance: jest.fn().mockResolvedValue(mockedProvenance),
          },
        },
        {
          provide: RedCompliancePairingService,
          useValue: {
            buildMatchedPairs: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RedComplianceService>(RedComplianceService);
    provenanceService = module.get<ProvenanceService>(ProvenanceService);
    pairingService = module.get<RedCompliancePairingService>(RedCompliancePairingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockedProvenance = {
    powerProductions: [{ id: 'ps-power-1', startedAt: '2025-01-01T10:00:00.000Z', executedBy: { id: 'power-1' } }],
    hydrogenProductions: [{ id: 'ps-h2-1', startedAt: '2025-01-01T10:30:00.000Z', executedBy: { id: 'h2-1' } }],
  };

  it('throws error when provenance or required productions are missing', async () => {
    jest.spyOn(provenanceService, 'buildProvenance').mockResolvedValue(undefined);

    await expect(service.determineRedCompliance(new ReadByIdPayload('root-ps'))).rejects.toThrow(RpcException);

    try {
      await service.determineRedCompliance(new ReadByIdPayload('root-ps'));
    } catch (e) {
      expect(e.message).toContain('Provenance or required productions');
    }
  });

  it('returns aggregated flags = true when rules hold for the single pair', async () => {
    const pairs = [
      {
        power: {
          processStep: { startedAt: '2025-01-01T10:00:00.000Z', executedBy: { id: 'power-1' } },
          unit: { biddingZone: 'DE-LU', commissionedOn: '2023-01-01T00:00:00.000Z', financialSupportReceived: false },
        },
        hydrogen: {
          processStep: { startedAt: '2025-01-01T10:30:00.000Z', executedBy: { id: 'h2-1' } },
          unit: { biddingZone: 'DE-LU', commissionedOn: '2024-01-01T00:00:00.000Z' },
        },
      },
    ];

    (pairingService.buildMatchedPairs as jest.Mock).mockResolvedValue(pairs);

    const result = await service.determineRedCompliance(new ReadByIdPayload('root-ps'));
    expect(result).toEqual(new RedComplianceEntity(true, true, true, true));
  });

  it('returns all false when the first pair violates all rules', async () => {
    const pairs = [
      {
        power: {
          processStep: { startedAt: '2025-01-01T09:00:00.000Z', executedBy: { id: 'power-1' } },
          unit: { biddingZone: 'AT', commissionedOn: '2010-01-01T00:00:00.000Z', financialSupportReceived: false },
        },
        hydrogen: {
          processStep: { startedAt: '2025-01-01T10:30:00.000Z', executedBy: { id: 'h2-1' } },
          unit: { biddingZone: 'DE-LU', commissionedOn: '2024-01-01T00:00:00.000Z' },
        },
      },
      // second pair should not be evaluated due to break
      {
        power: {
          processStep: { startedAt: '2025-01-01T10:00:00.000Z', executedBy: { id: 'power-2' } },
          unit: { biddingZone: 'DE-LU', commissionedOn: '2023-01-01T00:00:00.000Z', financialSupportReceived: true },
        },
        hydrogen: {
          processStep: { startedAt: '2025-01-01T10:00:00.000Z', executedBy: { id: 'h2-2' } },
          unit: { biddingZone: 'DE_LU', commissionedOn: '2024-01-01T00:00:00.000Z' },
        },
      },
    ];

    (pairingService.buildMatchedPairs as jest.Mock).mockResolvedValue(pairs);
    const result = await service.determineRedCompliance(new ReadByIdPayload('root-ps'));
    expect(result).toEqual(new RedComplianceEntity(false, false, false, false));
  });

  it('throws error when a pair is missing production units after enrichment', async () => {
    const pairs = [
      {
        power: {
          processStep: { executedBy: { id: 'power-1' }, startedAt: '2025-01-01T10:00:00.000Z' },
          unit: undefined as any,
        },
        hydrogen: {
          processStep: { executedBy: { id: 'h2-1' }, startedAt: '2025-01-01T10:00:00.000Z' },
          unit: undefined as any,
        },
      },
    ];

    (pairingService.buildMatchedPairs as jest.Mock).mockResolvedValue(pairs);

    await expect(service.determineRedCompliance(new ReadByIdPayload('root-ps'))).rejects.toThrow(HttpException);
    try {
      await service.determineRedCompliance(new ReadByIdPayload('root-ps'));
    } catch (e) {
      expect(e.message).toContain('Production units not found');
    }
  });
});
