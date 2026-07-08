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
  ComponentsOverviewDto,
  CreateProcessStepDto,
  DigitalProductPassportDto,
  getSpecificUnit,
  PaginatedDataDto,
  ProcessStepOverviewDto,
  UnitDto,
} from '@h2-trust/contracts/dtos';
import {
  DigitalProductPassportEntity,
  HydrogenComponentEntity,
  PaginatedProcessStepEntity,
  ProcessStepEntity,
  UnitDetailsType,
  UnitEntity,
} from '@h2-trust/contracts/entities';
import {
  CreateBatchDetailsPayload,
  CreateProcessStepPayload,
  ProcessStepDataFilter,
  ReadByIdPayload,
  ReadByOwnerIdAndTypePayload,
  ReadPaginatedProcessStepsPayload,
  ReadProcessStepsByUnitsPayload,
} from '@h2-trust/contracts/payloads';
import { ProcessType } from '@h2-trust/domain';
import {
  DigitalProductPassportMessagePatterns,
  ProcessStepMessagePatterns,
  QUEUE_GENERAL_SVC,
  QUEUE_PROCESS_SVC,
  UnitMessagePatterns,
} from '@h2-trust/messaging';
import { UserService } from '../user/user.service';

@Injectable()
export class ProcessStepService {
  constructor(
    @Inject(QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    @Inject(QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly userService: UserService,
  ) {}

  public async createProcessStep(
    dto: CreateProcessStepDto,
    files: Express.Multer.File[],
    userId: string,
  ): Promise<ProcessStepOverviewDto> {
    const details: CreateBatchDetailsPayload = new CreateBatchDetailsPayload(
      dto.details.rfnboType,
      dto.details.productionPowerType,
      dto.details.usedRenewablePower,
      dto.details.usedGridPower,
      dto.details.distance,
      dto.details.wasteWater,
      dto.details.resinConsumption,
      dto.details.compressedAir,
      dto.details.nitrogenConsumption,
    );
    const bottlingPayload: CreateProcessStepPayload = new CreateProcessStepPayload(
      details,
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

  public async readHydrogenComponentsForOwnUnits(userId: string): Promise<ComponentsOverviewDto[]> {
    const userDetails = await this.userService.readUserWithCompany(userId);

    const units: UnitEntity[] = await firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.READ_BY_OWNER_ID_AND_TYPE,
        new ReadByOwnerIdAndTypePayload(userDetails.company.id),
      ),
    );
    const specificUnits: UnitDto[] = units.map(getSpecificUnit);
    const specificUnitIds: string[] = specificUnits.map((specificUnit) => specificUnit.id);
    const payload: ReadProcessStepsByUnitsPayload = new ReadProcessStepsByUnitsPayload(specificUnitIds);
    const receivedHydrogenComponents: HydrogenComponentEntity[] = await firstValueFrom(
      this.processSvc.send(ProcessStepMessagePatterns.READ_ALL_BY_UNITS, payload),
    );

    return specificUnits.map((specificUnit) => {
      const capacity: number = 'capacity' in specificUnit ? specificUnit.capacity : 0;
      const unitSpecType: UnitDetailsType = 'type' in specificUnit ? specificUnit.type : undefined;
      const hydrogenComponentsOfSpecificUnit = receivedHydrogenComponents.filter(
        (component) => component.unitId === specificUnit.id,
      );
      return new ComponentsOverviewDto(
        specificUnit.id,
        specificUnit.name,
        specificUnit.unitType,
        capacity,
        hydrogenComponentsOfSpecificUnit,
        specificUnit.active,
        unitSpecType,
      );
    });
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
