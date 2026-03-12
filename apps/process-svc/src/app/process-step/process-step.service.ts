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
  PaginatedProcessStepEntity,
  ProcessStepEntity,
  ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload,
  ReadProcessStepsByPredecessorTypesAndOwnerPayload,
  ReadProcessStepsByTypesAndActiveAndOwnerPayload,
} from '@h2-trust/amqp';
import { ConfigurationService, MinioConfiguration } from '@h2-trust/configuration';
import { BatchRepository, ProcessStepRepository } from '@h2-trust/database';
import { ProcessType, RfnboType } from '@h2-trust/domain';

@Injectable()
export class ProcessStepService {
  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly batchRepository: BatchRepository,
    private readonly processStepRepository: ProcessStepRepository,
  ) {}

  async updateRfnboStatus(
    processStep: ProcessStepEntity,
    rfnboType: RfnboType,
  ): Promise<{ id: string; batchId: string }> {
    return this.batchRepository.setRfnboStatus(processStep.batch.id, rfnboType);
  }

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

    processStep.documents?.forEach((document) => {
      if (document.fileName) {
        documents.push(
          new DocumentEntity(
            document.id,
            document.fileName,
            `http://${minio.endPoint}:${minio.port}/${minio.bucketName}/${document.fileName}`,
          ),
        );
      }
    });

    return documents;
  }

  async readAllProcessStepsFromStorageUnit(hydrogenStorageUnitId: string): Promise<ProcessStepEntity[]> {
    return this.processStepRepository.findAllProcessStepsFromStorageUnit(hydrogenStorageUnitId);
  }

  async readProcessStepsByPredecessorTypesAndOwner(
    payload: ReadProcessStepsByPredecessorTypesAndOwnerPayload,
  ): Promise<ProcessStepEntity[]> {
    return this.processStepRepository.findProcessStepsByPredecessorTypesAndOwner(
      payload.predecessorProcessTypes,
      payload.ownerId,
    );
  }

  async readPaginatedProcessStepsByPredecessorTypesAndOwner(
    payload: ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload,
  ): Promise<PaginatedProcessStepEntity> {
    const processes: ProcessStepEntity[] = await this.processStepRepository.findProcessStepsByPredecessorTypesAndOwner(
      payload.predecessorProcessTypes,
      payload.ownerId,
      payload.filter.hydrogenProductionUnitName,
      payload.filter.period ? new Date(payload.filter.period) : payload.filter.period,
    );
    return this.createProcessStepsPagination(processes, payload.filter.pageSize, payload.filter.pageNumber);
  }

  private createProcessStepsPagination(processes: ProcessStepEntity[], pageSize: number, pageNumber: number) {
    const paginationStart: number = (pageNumber - 1) * pageSize;
    const paginationEnd: number = pageNumber * pageSize;

    return new PaginatedProcessStepEntity(
      processes.slice(paginationStart, paginationEnd),
      pageNumber,
      pageSize,
      processes.length,
    );
  }

  async readProcessStepsByTypesAndActiveAndOwner(
    payload: ReadProcessStepsByTypesAndActiveAndOwnerPayload,
  ): Promise<ProcessStepEntity[]> {
    return this.processStepRepository.findProcessStepsByTypesAndActiveAndOwner(
      payload.processTypes,
      payload.active,
      payload.ownerId,
    );
  }

  async setBatchesInactive(batchIds: string[]): Promise<{ count: number }> {
    return this.batchRepository.setBatchesInactive(batchIds);
  }
}
