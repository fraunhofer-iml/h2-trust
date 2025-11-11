/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { DocumentEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { ConfigurationService, MinioConfiguration } from '@h2-trust/configuration';
import { ProcessStepRepository } from '@h2-trust/database';
import { ProcessType } from '@h2-trust/domain';

@Injectable()
export class ProcessStepService {
  constructor(
    private readonly repository: ProcessStepRepository,
    private readonly configurationService: ConfigurationService,
  ) {}

  async readProcessSteps(
    processTypes: string[],
    predecessorProcessTypes: string[],
    active: boolean,
    companyId: string,
  ): Promise<ProcessStepEntity[]> {
    return this.repository.findProcessSteps(processTypes, predecessorProcessTypes, active, companyId);
  }

  async readProcessStep(processStepId: string): Promise<ProcessStepEntity> {
    const processStep: ProcessStepEntity = await this.repository.findProcessStep(processStepId);

    if (processStep.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      const predecessorProcessStep = await this.fetchPredecessorProcessStep(
        processStep.batch.predecessors[0]?.processStepId,
      );
      processStep.documents = await this.updateDocuments(predecessorProcessStep);
    } else {
      processStep.documents = await this.updateDocuments(processStep);
    }

    return processStep;
  }

  private async fetchPredecessorProcessStep(predecessorProcessStepId: string): Promise<ProcessStepEntity> {
    if (!predecessorProcessStepId) {
      const errorMessage = 'ProcessStepId of predecessor is missing.';
      throw new Error(errorMessage);
    }

    const predecessorProcessStep: ProcessStepEntity = await this.repository.findProcessStep(predecessorProcessStepId);

    if (predecessorProcessStep.type !== ProcessType.HYDROGEN_BOTTLING) {
      const errorMessage = `Expected process type of predecessor to be ${ProcessType.HYDROGEN_BOTTLING}, but got ${predecessorProcessStep.type}.`;
      throw new Error(errorMessage);
    }

    return predecessorProcessStep;
  }

  private async updateDocuments(processStep: ProcessStepEntity): Promise<DocumentEntity[]> {
    const documents: DocumentEntity[] = [];
    const minio: MinioConfiguration = this.configurationService.getGlobalConfiguration().minio;

    processStep.documents?.forEach((document, index) => {
      if (document.location) {
        documents.push({
          ...document,
          location: `http://${minio.endPoint}:${minio.port}/${minio.bucketName}/${document.location}`,
          description: `File #${index}`,
        });
      }
    });

    return documents;
  }

  async createProcessStep(processStepData: ProcessStepEntity): Promise<ProcessStepEntity> {
    return this.repository.insertProcessStep(processStepData);
  }
}
