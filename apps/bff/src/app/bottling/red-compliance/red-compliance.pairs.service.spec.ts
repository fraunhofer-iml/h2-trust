/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { HttpException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues, UnitMessagePatterns } from '@h2-trust/amqp';
import { RedCompliancePairingService } from './red-compliance.pairs.service';

describe('RedCompliancePairingService', () => {
  let service: RedCompliancePairingService;
  let generalSvc: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedCompliancePairingService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RedCompliancePairingService>(RedCompliancePairingService);
    generalSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_GENERAL_SVC);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const powerUnitIdA = 'power-1';
  const hydrogenUnitIdA = 'h2-1';
  const powerProcessStepA = {
    id: 'ps-power-1',
    startedAt: '2025-01-01T10:00:00.000Z',
    executedBy: { id: powerUnitIdA },
    batch: { successors: [{ processStepId: 'ps-h2-1' }] },
  } as any;
  const hydrogenProcessStepA = {
    id: 'ps-h2-1',
    startedAt: '2025-01-01T10:30:00.000Z',
    executedBy: { id: hydrogenUnitIdA },
  } as any;

  it('builds matched pairs and enriches them with units (happy path)', async () => {
    // arrange
    jest.spyOn(generalSvc, 'send').mockImplementation((pattern: any, data: any) => {
      if (pattern === UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS) {
        return of(
          data.ids.map((id: string) => ({
            id,
            biddingZone: 'DE_LU',
            commissionedOn: '2023-01-01',
            financialSupportReceived: false,
          })),
        );
      }
      if (pattern === UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS_BY_IDS) {
        return of(data.ids.map((id: string) => ({ id, biddingZone: 'DE_LU', commissionedOn: '2024-01-01' })));
      }
      return of(undefined);
    });

    // act
    const result = await service.buildMatchedPairs([powerProcessStepA], [hydrogenProcessStepA], 'root-ps');

    // assert
    expect(result).toHaveLength(1);
    const pair = result[0];
    expect(pair.power.processStep.id).toBe(powerProcessStepA.id);
    expect(pair.power.unit?.id).toBe(powerUnitIdA);
    expect(pair.hydrogen.processStep.id).toBe(hydrogenProcessStepA.id);
    expect(pair.hydrogen.unit?.id).toBe(hydrogenUnitIdA);
  });

  // TODO use again when matching is solved in long chains
  it.skip('throws error when no pairs can be built', async () => {
    await expect(
      service.buildMatchedPairs(
        [
          {
            id: 'ps-power-x',
            batch: { successors: [{ processStepId: 'no-match' }] },
            executedBy: { id: powerUnitIdA },
          } as any,
        ],
        [hydrogenProcessStepA],
        'root-ps',
      ),
    ).rejects.toThrow(HttpException);

    try {
      await service.buildMatchedPairs(
        [
          {
            id: 'ps-power-x',
            batch: { successors: [{ processStepId: 'no-match' }] },
            executedBy: { id: powerUnitIdA },
          } as any,
        ],
        [hydrogenProcessStepA],
        'root-ps',
      );
    } catch (e) {
      expect(e.message).toContain('No matching power↔hydrogen production pairs');
    }
  });
});
