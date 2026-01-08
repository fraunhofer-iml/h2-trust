/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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
  RedComplianceEntity,
  RedComplianceMessagePatterns,
  UserMessagePatterns,
} from '@h2-trust/amqp';
import {
  BottlingDto,
  BottlingOverviewDto,
  GeneralInformationDto,
  HydrogenComponentDto,
  UserDetailsDto,
} from '@h2-trust/api';
import { ProcessType, } from '@h2-trust/domain';
import { UserService } from '../user/user.service';

@Injectable()
export class BottlingService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy,
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly userService: UserService,
  ) { }

  async createBottling(dto: BottlingDto, files: Express.Multer.File[], userId: string): Promise<BottlingOverviewDto> {
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

    if (persistedBottling.transportationDetails) {
      const message = `ProcessStep [${persistedBottling.id}] of type [${persistedBottling.type}] should not have transportation details upon creation.`;
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }

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
    const userDetailsDto: UserDetailsDto = await this.userService.readUserWithCompany(userId);

    const payload: ReadProcessStepsByTypesAndActiveAndCompanyPayload =
      new ReadProcessStepsByTypesAndActiveAndCompanyPayload(
        [ProcessType.HYDROGEN_BOTTLING, ProcessType.HYDROGEN_TRANSPORTATION],
        true,
        userDetailsDto.company.id,
      );

    return firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.READ_ALL_BY_TYPES_AND_ACTIVE_AND_COMPANY, payload),
    ).then((processSteps) => processSteps.map(BottlingOverviewDto.fromEntity));
  }

  async readGeneralInformation(processStepId: string): Promise<GeneralInformationDto> {
    const processStep: ProcessStepEntity = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.READ_UNIQUE, new ReadByIdPayload(processStepId)),
    );

    if (processStep.type != ProcessType.HYDROGEN_BOTTLING && processStep.type != ProcessType.HYDROGEN_TRANSPORTATION) {
      const errorMessage = `ProcessStep with ID ${processStepId} should be of type ${ProcessType.HYDROGEN_BOTTLING} or ${ProcessType.HYDROGEN_TRANSPORTATION}, but is ${processStep.type}`;
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const generalInformationDto = GeneralInformationDto.fromEntityToDto(processStep);
    generalInformationDto.producer = await this.fetchProducerName(generalInformationDto.producer);
    generalInformationDto.hydrogenComposition = await this.fetchHydrogenComposition(processStep);

    const redCompliance: RedComplianceEntity = await firstValueFrom(
      this.processSvc.send(RedComplianceMessagePatterns.DETERMINE, new ReadByIdPayload(processStepId)),
    );

    return { ...generalInformationDto, redCompliance };
  }

  private async fetchProducerName(producerId: string): Promise<string> {
    const producer: UserDetailsDto = await firstValueFrom(
      this.generalSvc.send(UserMessagePatterns.READ, new ReadByIdPayload(producerId)),
    );
    return producer.company?.name;
  }

  private async fetchHydrogenComposition(processStep: ProcessStepEntity): Promise<HydrogenComponentDto[]> {
    // if the process step is of type transportation, we need to get the composition from the predecessor bottling process step
    const processStepId =
      processStep.type === ProcessType.HYDROGEN_TRANSPORTATION
        ? processStep.batch?.predecessors[0].processStepId
        : processStep.id;

    const hydrogenComposition: HydrogenComponentEntity[] = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION, new ReadByIdPayload(processStepId)),
    );

    return hydrogenComposition.map(HydrogenComponentDto.of);
  }
}
