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
import { BottlingDto, BottlingOverviewDto, DigitalProductPassportDto } from '@h2-trust/contracts/dtos';
import { DigitalProductPassportEntity, ProcessStepEntity } from '@h2-trust/contracts/entities';
import {
  CreateHydrogenBottlingPayload,
  CreateHydrogenTransportationPayload,
  ReadByIdPayload,
  ReadProcessStepsByTypesAndActiveAndOwnerPayload,
} from '@h2-trust/contracts/payloads';
import { ProcessType } from '@h2-trust/domain';
import { BrokerQueues, DigitalProductPassportPatterns, ProcessStepMessagePatterns } from '@h2-trust/messaging';
import { UserService } from '../user/user.service';

@Injectable()
export class BottlingService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly userService: UserService,
  ) {}

  async createBottlingAndTransportation(
    dto: BottlingDto,
    files: Express.Multer.File[],
    userId: string,
  ): Promise<BottlingOverviewDto> {
    const bottlingPayload: CreateHydrogenBottlingPayload = new CreateHydrogenBottlingPayload(
      dto.amount,
      dto.recipient,
      new Date(dto.filledAt),
      userId,
      dto.hydrogenStorageUnit,
      dto.color,
      dto.rfnboType,
      files,
    );

    const persistedBottling: ProcessStepEntity = await firstValueFrom(
      this.processSvc.send(ProcessStepMessagePatterns.CREATE_HYDROGEN_BOTTLING, bottlingPayload),
    );

    const transportationPayload: CreateHydrogenTransportationPayload = new CreateHydrogenTransportationPayload(
      persistedBottling,
      persistedBottling.batch,
      dto.transportMode,
      dto.distance,
      dto.fuelType,
    );

    const persistedTransportation: ProcessStepEntity = await firstValueFrom(
      this.processSvc.send(ProcessStepMessagePatterns.CREATE_HYDROGEN_TRANSPORTATION, transportationPayload),
    );
    return BottlingOverviewDto.fromEntity(persistedTransportation);
  }

  async readBottlingsAndTransportationsByOwner(userId: string): Promise<BottlingOverviewDto[]> {
    const userDetails = await this.userService.readUserWithCompany(userId);

    const payload = new ReadProcessStepsByTypesAndActiveAndOwnerPayload(
      [ProcessType.HYDROGEN_BOTTLING, ProcessType.HYDROGEN_TRANSPORTATION],
      true,
      userDetails.company.id,
    );

    const bottlingsAndTransportations: ProcessStepEntity[] = await firstValueFrom(
      this.processSvc.send(ProcessStepMessagePatterns.READ_ALL_BY_TYPES_AND_ACTIVE_AND_OWNER, payload),
    );
    return bottlingsAndTransportations.map(BottlingOverviewDto.fromEntity);
  }

  async readDigitalProductPassport(id: string): Promise<DigitalProductPassportDto> {
    const entity = await firstValueFrom(
      this.processSvc.send<DigitalProductPassportEntity>(
        DigitalProductPassportPatterns.READ_DIGITAL_PRODUCT_PASSPORT,
        new ReadByIdPayload(id),
      ),
    );

    return DigitalProductPassportDto.fromEntity(entity);
  }
}
