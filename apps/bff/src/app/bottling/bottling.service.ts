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
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ReadByIdPayload,
  ReadProcessStepsByTypesAndActiveAndCompanyPayload,
  RedComplianceMessagePatterns,
} from '@h2-trust/amqp';
import {
  BottlingDto,
  BottlingOverviewDto,
  GeneralInformationDto,
  HydrogenComponentDto,
} from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { UserService } from '../user/user.service';

@Injectable()
export class BottlingService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
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

    return firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.CREATE_HYDROGEN_TRANSPORTATION, transportationPayload),
    ).then(BottlingOverviewDto.fromEntity);
  }

  async readBottlingsByCompany(userId: string): Promise<BottlingOverviewDto[]> {
    const userDetails = await this.userService.readUserWithCompany(userId);

    const payload = new ReadProcessStepsByTypesAndActiveAndCompanyPayload(
      [ProcessType.HYDROGEN_BOTTLING, ProcessType.HYDROGEN_TRANSPORTATION],
      true,
      userDetails.company.id,
    );

    return firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.READ_ALL_BY_TYPES_AND_ACTIVE_AND_COMPANY, payload),
    ).then((processSteps) => processSteps.map(BottlingOverviewDto.fromEntity));
  }

  async readGeneralInformation(processStepId: string): Promise<GeneralInformationDto> {
    const processStep = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.READ_UNIQUE, new ReadByIdPayload(processStepId)),
    );

    const generalInformation = GeneralInformationDto.fromEntityToDto(processStep);

    const [producerName, hydrogenComposition, redCompliance] = await Promise.all([
      this.userService.readUserWithCompany(generalInformation.producer).then((user) => user.company.name),
      this.fetchHydrogenComposition(processStep.id),
      firstValueFrom(this.processSvc.send(RedComplianceMessagePatterns.DETERMINE, new ReadByIdPayload(processStepId))),
    ]);

    return {
      ...generalInformation,
      producer: producerName,
      hydrogenComposition,
      redCompliance,
    };
  }

  private async fetchHydrogenComposition(processStepId: string): Promise<HydrogenComponentDto[]> {
    const hydrogenComposition: HydrogenComponentEntity[] = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION, new ReadByIdPayload(processStepId)),
    );

    return hydrogenComposition.map(HydrogenComponentDto.of);
  }
}
