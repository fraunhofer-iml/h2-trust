/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerQueues,
  CreateHydrogenBottlingPayload,
  CreateHydrogenTransportationPayload,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ReadProcessStepsByTypesAndActiveAndCompanyPayload,
} from '@h2-trust/amqp';
import {
  BottlingDto,
  BottlingOverviewDto,
} from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { UserService } from '../user/user.service';

@Injectable()
export class BottlingService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy,
    private readonly userService: UserService,
  ) { }

  async createBottlingAndTransportation(dto: BottlingDto, files: Express.Multer.File[], userId: string): Promise<BottlingOverviewDto> {
    const bottlingPayload: CreateHydrogenBottlingPayload = new CreateHydrogenBottlingPayload(
      dto.amount,
      dto.recipient,
      new Date(dto.filledAt),
      userId,
      dto.hydrogenStorageUnit,
      dto.color,
      dto.fileDescription,
      files,
    );

    const persistedBottling: ProcessStepEntity = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.CREATE_HYDROGEN_BOTTLING, bottlingPayload),
    );

    const transportationPayload: CreateHydrogenTransportationPayload = new CreateHydrogenTransportationPayload(
      persistedBottling,
      persistedBottling.batch,
      dto.transportMode,
      dto.distance,
      dto.fuelType,
    );

    const persistedTransportation: ProcessStepEntity = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.CREATE_HYDROGEN_TRANSPORTATION, transportationPayload),
    );
    return BottlingOverviewDto.fromEntity(persistedTransportation);
  }

  async readBottlingsAndTransportationsByCompany(userId: string): Promise<BottlingOverviewDto[]> {
    const userDetails = await this.userService.readUserWithCompany(userId);

    const payload = new ReadProcessStepsByTypesAndActiveAndCompanyPayload(
      [ProcessType.HYDROGEN_BOTTLING, ProcessType.HYDROGEN_TRANSPORTATION],
      true,
      userDetails.company.id,
    );

    const bottlingsAndTransportations: ProcessStepEntity[] = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.READ_ALL_BY_TYPES_AND_ACTIVE_AND_COMPANY, payload),
    );
    return bottlingsAndTransportations.map(BottlingOverviewDto.fromEntity);
  }
}
