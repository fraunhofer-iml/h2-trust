/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  CreateManyProcessStepsPayload,
  DocumentEntity,
  ProcessStepEntity,
  ReadProcessStepsByPredecessorTypesAndCompanyPayload,
  ReadProcessStepsByTypesAndActiveAndCompanyPayload,
} from '@h2-trust/amqp';
import { ConfigurationService, MinioConfiguration } from '@h2-trust/configuration';
import { BatchRepository, ProcessStepRepository } from '@h2-trust/database';
import { ProcessType } from '@h2-trust/domain';

@Injectable()
export class ProcessStepService {
  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly batchRepository: BatchRepository,
    private readonly processStepRepository: ProcessStepRepository,
  ) {}

  async createProcessStep(processStep: ProcessStepEntity): Promise<ProcessStepEntity> {
    return this.processStepRepository.insertProcessStep(processStep);
  }

  async createManyProcessSteps(payload: CreateManyProcessStepsPayload): Promise<ProcessStepEntity[]> {
    return this.processStepRepository.insertManyProcessSteps(payload.processSteps);
  }

  async readProcessStep(processStepId: string): Promise<ProcessStepEntity> {
    const processStep: ProcessStepEntity = await this.processStepRepository.findProcessStep(processStepId);

    if (processStep.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      const predecessorProcessStep = await this.readPredecessorProcessStep(
        processStep.batch.predecessors[0]?.processStepId,
      );
      processStep.documents = this.assembleDocuments(predecessorProcessStep);
    } else {
      processStep.documents = this.assembleDocuments(processStep);
    }

    return processStep;
  }

  private async readPredecessorProcessStep(predecessorProcessStepId: string): Promise<ProcessStepEntity> {
    if (!predecessorProcessStepId) {
      throw new Error('ProcessStepId of predecessor is missing.');
    }

    const predecessorProcessStep: ProcessStepEntity =
      await this.processStepRepository.findProcessStep(predecessorProcessStepId);

    if (predecessorProcessStep.type !== ProcessType.HYDROGEN_BOTTLING) {
      throw new Error(
        `Expected process type of predecessor to be ${ProcessType.HYDROGEN_BOTTLING}, but got ${predecessorProcessStep.type}.`,
      );
    }

    return predecessorProcessStep;
  }

  private assembleDocuments(processStep: ProcessStepEntity): DocumentEntity[] {
    const documents: DocumentEntity[] = [];
    const minio: MinioConfiguration = this.configurationService.getGlobalConfiguration().minio;

    processStep.documents?.forEach((document, index) => {
      if (document.location) {
        documents.push({
          id: document.id,
          location: `http://${minio.endPoint}:${minio.port}/${minio.bucketName}/${document.location}`,
          description: `File #${index}`,
        });
      }
    });

    return documents;
  }

  async readAllProcessStepsFromStorageUnit(hydrogenStorageUnitId: string): Promise<ProcessStepEntity[]> {
    return this.processStepRepository.findAllProcessStepsFromStorageUnit(hydrogenStorageUnitId);
  }

  async readProcessStepsByPredecessorTypesAndCompany(
    payload: ReadProcessStepsByPredecessorTypesAndCompanyPayload,
  ): Promise<ProcessStepEntity[]> {
    return this.processStepRepository.findProcessStepsByPredecessorTypesAndCompany(
      payload.predecessorProcessTypes,
      payload.companyId,
    );
  }

  async readProcessStepsByTypesAndActiveAndCompany(
    payload: ReadProcessStepsByTypesAndActiveAndCompanyPayload,
  ): Promise<ProcessStepEntity[]> {
    return this.processStepRepository.findProcessStepsByTypesAndActiveAndCompany(
      payload.processTypes,
      payload.active,
      payload.companyId,
    );
  }

  async setBatchesInactive(batchIds: string[]): Promise<{ count: number }> {
    return this.batchRepository.setBatchesInactive(batchIds);
  }
}
