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
import {
  BatchDto,
  CreateProcessStepDto,
  DigitalProductPassportDto,
  HydrogenComponentDto,
  PaginatedDataDto,
  ProcessStepOverviewDto,
} from '@h2-trust/contracts/dtos';
import {
  DigitalProductPassportEntity,
  HydrogenComponentEntity,
  PaginatedProcessStepEntity,
  ProcessStepEntity,
} from '@h2-trust/contracts/entities';
import {
  CreateProcessStepPayload,
  CreateProcessStepQualityPayload,
  ProcessStepDataFilter,
  ReadByIdPayload,
  ReadPaginatedProcessStepsPayload,
  ReadProcessStepsByUnitPayload,
} from '@h2-trust/contracts/payloads';
import { ProcessType } from '@h2-trust/domain';
import {
  DigitalProductPassportMessagePatterns,
  ProcessStepMessagePatterns,
  QUEUE_PROCESS_SVC,
} from '@h2-trust/messaging';
import { UserService } from '../user/user.service';

@Injectable()
export class ProcessStepService {
  constructor(
    @Inject(QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly userService: UserService,
  ) {}

  public async createProcessStep(
    dto: CreateProcessStepDto,
    files: Express.Multer.File[],
    userId: string,
  ): Promise<ProcessStepOverviewDto> {
    const qualityDetails: CreateProcessStepQualityPayload = new CreateProcessStepQualityPayload(
      dto.qualityDetails.rfnboType,
      dto.qualityDetails.productionPowerType,
      dto.qualityDetails.usedRenewablePower,
      dto.qualityDetails.usedGridPower,
      dto.qualityDetails.distance,
      dto.qualityDetails.wasteWater,
      dto.qualityDetails.resinConsumption,
      dto.qualityDetails.compressedAir,
      dto.qualityDetails.nitrogenConsumption,
    );
    const bottlingPayload: CreateProcessStepPayload = new CreateProcessStepPayload(
      qualityDetails,
      dto.processType,
      dto.amount,
      dto.recipient,
      userId,
      new Date(dto.filledAt),
      new Date(dto.filledAt),
      dto.executingUnitId,
      dto.predecessorUnitId,
      files,
    );

    const persistedProcessStep: ProcessStepEntity = await firstValueFrom(
      this.processSvc.send(ProcessStepMessagePatterns.CREATE_PROCESS_STEP, bottlingPayload),
    );

    return ProcessStepOverviewDto.fromEntity(persistedProcessStep);
  }

  public async readPaginatedProcessSteps(
    userId: string,
    pageNumber: number,
    pageSize: number,
    batchId?: string,
    processType?: ProcessType,
  ): Promise<PaginatedDataDto<BatchDto>> {
    const userDetails = await this.userService.readUserWithCompany(userId);

    const payload = new ReadPaginatedProcessStepsPayload(
      userDetails.company.id,
      new ProcessStepDataFilter(pageNumber, pageSize, batchId, processType),
    );

    const paginatedProcessSteps: PaginatedProcessStepEntity = await firstValueFrom(
      this.processSvc.send(ProcessStepMessagePatterns.READ_PROCESS_STEP_PAGINATION, payload),
    );
    const batches: BatchDto[] = paginatedProcessSteps.processSteps.map(BatchDto.fromProcessStepEntity);
    return new PaginatedDataDto<BatchDto>(
      batches,
      paginatedProcessSteps.totalAmountOfItems,
      paginatedProcessSteps.currentPage,
    );
  }

  public async readHydrogenComponentsForUnits(unitIds: string[], userId: string): Promise<HydrogenComponentDto[]> {
    const userDetails = await this.userService.readUserWithCompany(userId);

    const payload = new ReadProcessStepsByUnitPayload(unitIds, true, userDetails.company.id);

    const hydrogenComponents: HydrogenComponentEntity[] = await firstValueFrom(
      this.processSvc.send(ProcessStepMessagePatterns.READ_ALL_BY_UNIT, payload),
    );
    return hydrogenComponents.map(HydrogenComponentDto.fromEntity);
  }

  public async readDigitalProductPassport(id: string): Promise<DigitalProductPassportDto> {
    const entity = await firstValueFrom(
      this.processSvc.send<DigitalProductPassportEntity>(
        DigitalProductPassportMessagePatterns.READ,
        new ReadByIdPayload(id),
      ),
    );

    return DigitalProductPassportDto.fromEntity(entity);
  }
}
