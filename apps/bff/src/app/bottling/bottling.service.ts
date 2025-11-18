/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {firstValueFrom} from 'rxjs';
import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {
  BrokerQueues,
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  TransportationDetailsEntity,
  UserMessagePatterns,
} from '@h2-trust/amqp';
import {
  BottlingDto,
  BottlingOverviewDto,
  GeneralInformationDto,
  HydrogenComponentDto,
  RedComplianceDto,
  UserDetailsDto,
} from '@h2-trust/api';
import {ProcessType, TransportMode} from '@h2-trust/domain';
import {UserService} from '../user/user.service';

@Injectable()
export class BottlingService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy,
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly userService: UserService,
  ) {
  }

  async createBottling(dto: BottlingDto, files: Express.Multer.File[], userId: string): Promise<BottlingOverviewDto> {
    const processStepEntity: ProcessStepEntity = await firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.HYDROGEN_BOTTLING, {
        processStepEntity: BottlingDto.toEntity({...dto, recordedBy: userId}),
        files,
      }),
    );

    if (processStepEntity.transportationDetails) {
      throw new HttpException(
        `ProcessStep with ID ${processStepEntity.id} should not have transportation details upon creation.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    processStepEntity.transportationDetails = this.buildTransportationDetails(dto);

    return firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.HYDROGEN_TRANSPORTATION, {processStepEntity}),
    ).then(BottlingOverviewDto.fromEntity);
  }

  async readBottlingsByCompany(userId: string): Promise<BottlingOverviewDto[]> {
    const userDetailsDto: UserDetailsDto = await this.userService.readUserWithCompany(userId);

    return firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.READ_ALL, {
        processTypes: [ProcessType.HYDROGEN_BOTTLING, ProcessType.HYDROGEN_TRANSPORTATION],
        active: true,
        companyId: userDetailsDto.company.id,
      }),
    ).then((processSteps) => processSteps.map(BottlingOverviewDto.fromEntity));
  }

  async readGeneralInformation(processStepId: string): Promise<GeneralInformationDto> {
    const processStep: ProcessStepEntity = await firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.READ_UNIQUE, {processStepId}),
    );

    if (processStep.type != ProcessType.HYDROGEN_BOTTLING && processStep.type != ProcessType.HYDROGEN_TRANSPORTATION) {
      const errorMessage = `ProcessStep with ID ${processStepId} should be of type ${ProcessType.HYDROGEN_BOTTLING} or ${ProcessType.HYDROGEN_TRANSPORTATION}, but is ${processStep.type}`;
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const generalInformationDto = GeneralInformationDto.fromEntityToDto(processStep);
    generalInformationDto.producer = await this.fetchProducerName(generalInformationDto.producer);
    generalInformationDto.hydrogenComposition = await this.fetchHydrogenComposition(processStep);
    return {...generalInformationDto, redCompliance: new RedComplianceDto(true, true, false, true)};
  }

  private buildTransportationDetails(dto: BottlingDto): TransportationDetailsEntity {
    switch (dto.transportMode) {
      case TransportMode.TRAILER:
        if (dto.transportDistance == undefined) {
          const message = `Transport distance is required for trailer transportation.`;
          throw new HttpException(message, HttpStatus.BAD_REQUEST);
        }
        if (dto.fuelType == undefined) {
          const message = `Transport fuel type is required for trailer transportation.`;
          throw new HttpException(message, HttpStatus.BAD_REQUEST);
        }
        return new TransportationDetailsEntity(undefined, dto.transportDistance, dto.transportMode, dto.fuelType);
      case TransportMode.PIPELINE:
        return new TransportationDetailsEntity(undefined, 0, dto.transportMode, undefined);
      default:
        const message = `Invalid transport mode: ${dto.transportMode}`;
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  private async fetchProducerName(producerId: string): Promise<string> {
    const producer: UserDetailsDto = await firstValueFrom(
      this.generalService.send(UserMessagePatterns.READ, {id: producerId}),
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
      this.batchService.send(ProcessStepMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION, processStepId),
    );

    return hydrogenComposition.map(HydrogenComponentDto.of);
  }
}
