/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test } from '@nestjs/testing';
import {
  BatchEntityHydrogenProducedMock,
  ProcessStepEntity,
  ProcessStepEntityHydrogenBottlingMock,
  ProcessStepEntityHydrogenProductionMock,
  ProcessStepEntityHydrogenTransportationMock,
  ReadByIdPayload,
  ReadProcessStepsByPredecessorTypesAndCompanyPayload,
} from '@h2-trust/amqp';
import { ConfigurationService, MinioConfiguration } from '@h2-trust/configuration';
import { ProcessStepRepository } from '@h2-trust/database';
import { ProcessType } from '@h2-trust/domain';
import { ProcessStepService } from './process-step.service';

describe('ProcessStepService', () => {
  let service: ProcessStepService;
  let repository: jest.Mocked<ProcessStepRepository>;

  const minioConfig = {
    endPoint: 'minio.local',
    port: 9000,
    bucketName: 'docs-bucket',
  } as MinioConfiguration;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProcessStepService,
        {
          provide: ProcessStepRepository,
          useValue: {
            findProcessStepsByPredecessorTypesAndCompany: jest.fn(),
            findProcessStep: jest.fn(),
            insertProcessStep: jest.fn(),
          },
        },
        {
          provide: ConfigurationService,
          useValue: {
            getGlobalConfiguration: jest.fn().mockReturnValue({
              minio: minioConfig,
            }),
          },
        },
      ],
    }).compile();

    service = module.get(ProcessStepService);
    repository = module.get(ProcessStepRepository);
  });

  describe('readProcessSteps', () => {
    it('should return process steps for given criteria', async () => {
      // Arrange
      const fixture: ProcessStepEntity[] = [
        ProcessStepEntityHydrogenProductionMock[0],
        ProcessStepEntityHydrogenProductionMock[1],
      ];
      repository.findProcessStepsByPredecessorTypesAndCompany.mockResolvedValue(fixture);

      const givenPredecessorProcessTypes = [fixture[0].type];
      const givenCompanyId = fixture[0].recordedBy.company.id;

      const payload: ReadProcessStepsByPredecessorTypesAndCompanyPayload =
        ReadProcessStepsByPredecessorTypesAndCompanyPayload.of(givenPredecessorProcessTypes, givenCompanyId);

      // Act
      const actualResponse = await service.readProcessStepsByPredecessorTypesAndCompany(payload);

      // Assert
      expect(repository.findProcessStepsByPredecessorTypesAndCompany).toHaveBeenCalledWith(
        givenPredecessorProcessTypes,
        givenCompanyId,
      );
      expect(actualResponse).toBe(fixture);
    });
  });

  describe('readProcessStep (HYDROGEN_BOTTLING)', () => {
    it('should return enriched process step with full document URLs and filtered locations', async () => {
      // Arrange
      const hydrogenProductionFixture: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
      hydrogenProductionFixture.documents = [
        { id: 'd1', location: 'path/file1.pdf', description: 'Some Description 1' },
        { id: 'd2', location: undefined, description: 'FILTERED OUT' },
        { id: 'd3', location: 'path/file3.png', description: 'Some Description 2' },
      ];
      repository.findProcessStep.mockResolvedValue(hydrogenProductionFixture);

      // Act
      const actualResponse: ProcessStepEntity = await service.readProcessStep(
        ReadByIdPayload.of(hydrogenProductionFixture.id),
      );

      // Assert
      expect(repository.findProcessStep).toHaveBeenCalledWith(hydrogenProductionFixture.id);
      expect(actualResponse.documents).toHaveLength(2);
      expect(actualResponse.documents?.[0]).toMatchObject({
        location: `http://${minioConfig.endPoint}:${minioConfig.port}/${minioConfig.bucketName}/path/file1.pdf`,
        description: 'File #0',
      });
      expect(actualResponse.documents?.[1]).toMatchObject({
        location: `http://${minioConfig.endPoint}:${minioConfig.port}/${minioConfig.bucketName}/path/file3.png`,
        description: 'File #2',
      });
    });
  });

  describe('readProcessStep (HYDROGEN_TRANSPORTATION)', () => {
    it('should use predecessor documents for transportation steps', async () => {
      // Arrange
      const hydrogenBottlingFixture: ProcessStepEntity = ProcessStepEntityHydrogenBottlingMock[0];
      hydrogenBottlingFixture.documents = [{ id: 'd1', location: 'path/file1.pdf', description: 'Some Description 1' }];

      const hydrogenTransportationFixture: ProcessStepEntity = ProcessStepEntityHydrogenTransportationMock[0];
      hydrogenTransportationFixture.batch.predecessors = [
        { ...BatchEntityHydrogenProducedMock[0], processStepId: hydrogenBottlingFixture.id },
      ];

      // First call for transportation id, second call for bottling id
      repository.findProcessStep.mockImplementation(async (id: string) => {
        if (id === hydrogenTransportationFixture.id) return hydrogenTransportationFixture;
        if (id === hydrogenBottlingFixture.id) return hydrogenBottlingFixture;
        throw new Error('unexpected id');
      });

      // Act
      const actualResponse = await service.readProcessStep(ReadByIdPayload.of(hydrogenTransportationFixture.id));

      // Assert
      expect(repository.findProcessStep).toHaveBeenCalledWith(hydrogenTransportationFixture.id);
      expect(repository.findProcessStep).toHaveBeenCalledWith(hydrogenBottlingFixture.id);
      expect(actualResponse.documents).toHaveLength(1);
      expect(actualResponse.documents?.[0]).toMatchObject({
        location: `http://${minioConfig.endPoint}:${minioConfig.port}/${minioConfig.bucketName}/path/file1.pdf`,
        description: 'File #0',
      });
    });

    it('should throw an error when predecessor processStepId is missing', async () => {
      // Arrange
      const hydrogenTransportationFixture: ProcessStepEntity = ProcessStepEntityHydrogenTransportationMock[0];
      hydrogenTransportationFixture.batch.predecessors = [
        { ...BatchEntityHydrogenProducedMock[0], processStepId: undefined },
      ];

      repository.findProcessStep.mockResolvedValue(hydrogenTransportationFixture);

      // Act & Assert
      await expect(service.readProcessStep(ReadByIdPayload.of(hydrogenTransportationFixture.id))).rejects.toThrow(
        'ProcessStepId of predecessor is missing.',
      );
    });

    it('throws when predecessor type is not HYDROGEN_BOTTLING', async () => {
      // Arrange
      const hydrogenProductionFixture: ProcessStepEntity = ProcessStepEntityHydrogenProductionMock[0];

      const hydrogenTransportationFixture: ProcessStepEntity = ProcessStepEntityHydrogenTransportationMock[0];
      hydrogenTransportationFixture.batch.predecessors = [
        { ...BatchEntityHydrogenProducedMock[0], processStepId: hydrogenProductionFixture.id },
      ];

      // First call for transportation id, second call for production id
      repository.findProcessStep.mockImplementation(async (id: string) => {
        if (id === hydrogenTransportationFixture.id) return hydrogenTransportationFixture;
        if (id === hydrogenProductionFixture.id) return hydrogenProductionFixture;
        throw new Error('unexpected id');
      });

      const expectedErrorMessage = `Expected process type of predecessor to be ${ProcessType.HYDROGEN_BOTTLING}, but got ${ProcessType.HYDROGEN_PRODUCTION}.`;

      // Act & Assert
      await expect(service.readProcessStep(ReadByIdPayload.of(hydrogenTransportationFixture.id))).rejects.toThrow(
        expectedErrorMessage,
      );
    });
  });
});
