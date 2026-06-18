/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CentralizedStorageConfiguration, ConfigurationService } from '@h2-trust/configuration';
import {
  BatchEntity,
  DocumentEntity,
  HydrogenComponentEntity,
  PaginatedProcessStepEntity,
  ProcessStepEntity,
  ProvenanceEntity,
  UnitEntity,
} from '@h2-trust/contracts/entities';
import {
  CreateHydrogenProductionStatisticsPayload,
  CreateManyProcessStepsPayload,
  CreateProcessStepPayload,
  ReadByIdPayload,
  ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload,
  ReadPaginatedProcessStepsPayload,
  ReadProcessStepsByTypesAndActiveAndOwnerPayload,
} from '@h2-trust/contracts/payloads';
import { BatchRepository, DocumentRepository, ProcessStepRepository } from '@h2-trust/database';
import { RfnboType } from '@h2-trust/domain';
import { DomainException, ErrorCode, ValidationException } from '@h2-trust/exceptions';
import { QUEUE_GENERAL_SVC, UnitMessagePatterns } from '@h2-trust/messaging';
import { CentralizedStorageService, ContentType } from '@h2-trust/storage';
import { assertDefined } from '@h2-trust/utils';
import { assembleProofOfSustainability } from '../digital-product-passport/proof-of-sustainability/proof-of-sustainability.assembler';
import { validateEmissionData, validateUnitType } from './process-step-validator';
import { allocateBottling, BottlingAllocation } from './utils/bottling.allocator';
import { buildProcessStepEntity } from './utils/bottling.assembler';
import { computeHydrogenComposition } from './utils/hydrogen-composition';

@Injectable()
export class ProcessStepService {
  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly batchRepository: BatchRepository,
    private readonly processStepRepository: ProcessStepRepository,
    private readonly storageService: CentralizedStorageService,
    private readonly documentRepository: DocumentRepository,
    @Inject(QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
  ) {}

  public async createGenericProcessStep(payload: CreateProcessStepPayload): Promise<ProcessStepEntity> {
    //Get executing unit
    const executingUnit: UnitEntity = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ_BY_ID, new ReadByIdPayload(payload.executingUnitId)),
    );

    //validate input for new process step
    validateUnitType(payload, executingUnit);
    validateEmissionData(payload);

    //the unit id from which the predecessors of the new process step should be used
    const unitIdOfPredecessors: string = payload.predecessorUnitId;
    const predecessorCandidates: ProcessStepEntity[] = await this.readAllProcessStepsFromUnits([unitIdOfPredecessors]);
    if (predecessorCandidates.length === 0) {
      throw new DomainException(
        ErrorCode.DOMAIN_BUSINESS_RULE_VIOLATION,
        `No process steps found in unit '${unitIdOfPredecessors}'`,
      );
    }

    //all candidates from the given unit as Hydrogen Components
    //needed for the case that the hydrogen is not enough
    const predecessorCandidateComponents: HydrogenComponentEntity[] = predecessorCandidates.map((processStep) => ({
      processId: processStep.id,
      amount: processStep.batch.amount,
      rfnboType: processStep.batch.qualityDetails.rfnboType,
    }));

    //calculate the needed amount of each rfnbo typed hydrogen
    const optimalPredecessors: HydrogenComponentEntity[] = computeHydrogenComposition(
      predecessorCandidateComponents,
      payload.amount,
      [],
      payload.qualityDetails.rfnboType,
    );

    //the process steps that should be used as predecessor and those which should be split
    const allocation: BottlingAllocation = allocateBottling(predecessorCandidates, optimalPredecessors, [
      unitIdOfPredecessors,
    ]);

    //set batches used as predecessor and those that should be splitted to inactive
    const batchesToSetInactive: BatchEntity[] = [
      ...allocation.batchesForBottle,
      ...allocation.processStepsToBeSplit.map((ps) => ps.batch),
    ];
    await this.setBatchesInactive(batchesToSetInactive.map((batch) => batch.id));

    //persist the split process steps
    //distinct between the splitted batches that are used as predecessors and those who will remain active
    const persistedConsumedSplitProcessSteps: ProcessStepEntity[] = await Promise.all(
      allocation.consumedSplitProcessSteps.map((step) => this.createProcessStep(step)),
    );
    //persist the splitted batches that are inactive and used for the new process step
    const persistedConsumedSplitBatches: BatchEntity[] = persistedConsumedSplitProcessSteps.map((ps) => ps.batch);

    //persist the splitted batches that are active and can be used in other ps creation
    await Promise.all(allocation.processStepsForRemainingAmount.map((ps) => this.createProcessStep(ps)));

    //build new process step

    const bottlingProcessStep: ProcessStepEntity = buildProcessStepEntity(
      payload,
      [...allocation.batchesForBottle, ...persistedConsumedSplitBatches],
      executingUnit,
    );

    //determine the rfnbo value of the new process step
    const rfnboTypeWithoutEmissionReduction: RfnboType =
      bottlingProcessStep?.batch?.qualityDetails?.rfnboType ?? RfnboType.NOT_SPECIFIED;
    const provenance: ProvenanceEntity = new ProvenanceEntity(bottlingProcessStep, [bottlingProcessStep], []);
    const proofOfSustainability = assembleProofOfSustainability(provenance);
    const isEmissionReductionAbove70Percent = proofOfSustainability.emissionReductionPercentage > 70;
    bottlingProcessStep.batch.qualityDetails.rfnboType =
      rfnboTypeWithoutEmissionReduction === RfnboType.RFNBO_READY && isEmissionReductionAbove70Percent
        ? RfnboType.RFNBO_READY
        : RfnboType.NON_CERTIFIABLE;

    const persistedBottlingProcessStep: ProcessStepEntity = await this.createProcessStep(bottlingProcessStep);

    if (payload.files) {
      await Promise.all(
        payload.files.map((file) => this.addDocumentToProcessStep(file, persistedBottlingProcessStep.id)),
      );
    }

    return this.readProcessStep(persistedBottlingProcessStep.id);
  }

  private async addDocumentToProcessStep(file: Express.Multer.File, processStepId: string): Promise<DocumentEntity> {
    assertDefined(file.buffer, 'file.buffer');
    await this.storageService.uploadFile(file.originalname, Buffer.from(file.buffer), ContentType.PDF);

    return this.documentRepository.addDocumentToProcessStep(
      new DocumentEntity(undefined, file.originalname),
      processStepId,
    );
  }

  public async getPredecessors(processStep: ProcessStepEntity): Promise<ProcessStepEntity[]> {
    const processStepIds = await this.processStepRepository.findPredecessorProcessSteps(processStep.batch.id);
    const processSteps: ProcessStepEntity[] = await this.processStepRepository.findProcessSteps(processStepIds);
    return [processStep, ...processSteps];
  }

  private createProcessStep(processStep: ProcessStepEntity): Promise<ProcessStepEntity> {
    return this.processStepRepository.insertProcessStep(processStep);
  }

  public createManyProcessSteps(payload: CreateManyProcessStepsPayload): Promise<ProcessStepEntity[]> {
    return this.processStepRepository.insertManyProcessSteps(payload.processSteps);
  }

  public async readProcessStep(processStepId: string): Promise<ProcessStepEntity> {
    const processStep: ProcessStepEntity = await this.processStepRepository.findProcessStep(processStepId);

    const predecessorProcessStep = await this.processStepRepository.findProcessStep(
      processStep.batch.predecessors[0]?.processStepId,
    );
    processStep.documents = this.assembleDocuments(predecessorProcessStep);

    return processStep;
  }

  public async readProcessStepByBatchId(batchId: string): Promise<ProcessStepEntity> {
    const processStep: ProcessStepEntity = await this.processStepRepository.findProcessStepByBatchId(batchId);

    const predecessorProcessStep = await this.processStepRepository.findProcessStep(
      processStep.batch.predecessors[0]?.processStepId,
    );
    processStep.documents = this.assembleDocuments(predecessorProcessStep);

    return processStep;
  }

  private assembleDocuments(processStep: ProcessStepEntity): DocumentEntity[] {
    const documents: DocumentEntity[] = [];
    const configuration: CentralizedStorageConfiguration =
      this.configurationService.getGlobalConfiguration().centralizedStorage;

    processStep.documents?.forEach((document) => {
      if (document.fileName) {
        documents.push(
          new DocumentEntity(
            document.id,
            document.fileName,
            `${configuration.endpointUrl}/${configuration.bucketName}/${document.fileName}`,
          ),
        );
      }
    });

    return documents;
  }

  private readAllProcessStepsFromUnits(unitIds: string[]): Promise<ProcessStepEntity[]> {
    return this.processStepRepository.findAllProcessStepsFromUnits(unitIds);
  }

  public async readAllHydrogenComponentsFromUnits(unitIds: string[]): Promise<HydrogenComponentEntity[]> {
    const processSteps: ProcessStepEntity[] = await this.readAllProcessStepsFromUnits(unitIds);

    return processSteps.map(
      (processStep) =>
        new HydrogenComponentEntity(
          processStep.id,
          processStep.batch.amount,
          processStep.batch.qualityDetails.rfnboType,
        ),
    );
  }

  public readProcessStepsByPredecessorTypesAndUnitAndDate(
    predecessorProcessType: string[],
    payload: CreateHydrogenProductionStatisticsPayload,
  ): Promise<ProcessStepEntity[]> {
    return this.processStepRepository.findProcessStepsByPredecessorTypesAndOwner(
      predecessorProcessType,
      payload.ownerId,
      payload.unitName,
      payload.month ? new Date(payload.month) : payload.month,
    );
  }

  public async readPaginatedProcessSteps(
    payload: ReadPaginatedProcessStepsPayload,
  ): Promise<PaginatedProcessStepEntity> {
    if (payload.filter.pageNumber <= 0) {
      throw new ValidationException(`pageNumber must be greater than 0, got ${payload.filter.pageNumber}`);
    }
    if (payload.filter.pageSize <= 0) {
      throw new ValidationException(`pageSize must be greater than 0, got ${payload.filter.pageSize}`);
    }
    const processes: ProcessStepEntity[] = await this.processStepRepository.findProcessStepsByPredecessorTypesAndOwner(
      undefined,
      payload.ownerId,
      undefined,
      undefined,
      payload.filter.processStepId,
      payload.filter.processType,
    );
    return this.createProcessStepsPagination(processes, payload.filter.pageSize, payload.filter.pageNumber);
  }

  public async readPaginatedProductions(
    payload: ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload,
  ): Promise<PaginatedProcessStepEntity> {
    if (payload.filter.pageNumber <= 0) {
      throw new ValidationException(`pageNumber must be greater than 0, got ${payload.filter.pageNumber}`);
    }
    if (payload.filter.pageSize <= 0) {
      throw new ValidationException(`pageSize must be greater than 0, got ${payload.filter.pageSize}`);
    }
    const processes: ProcessStepEntity[] = await this.processStepRepository.findProcessStepsByPredecessorTypesAndOwner(
      payload.predecessorProcessTypes,
      payload.ownerId,
      payload.filter.unitName,
      payload.filter.month ? new Date(payload.filter.month) : payload.filter.month,
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

  public readProcessStepsByTypesAndActiveAndOwner(
    payload: ReadProcessStepsByTypesAndActiveAndOwnerPayload,
  ): Promise<ProcessStepEntity[]> {
    return this.processStepRepository.findProcessStepsByTypesAndActiveAndOwner(
      payload.processTypes,
      payload.active,
      payload.ownerId,
    );
  }

  private setBatchesInactive(batchIds: string[]): Promise<{ count: number }> {
    return this.batchRepository.setBatchesInactive(batchIds);
  }
}
