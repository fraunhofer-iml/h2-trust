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
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ReadByIdPayload,
  ReadProcessStepsPayload,
  TransportationDetailsEntity,
  UserMessagePatterns,
} from '@h2-trust/amqp';
import {
  BottlingDto,
  BottlingOverviewDto,
  GeneralInformationDto,
  HydrogenComponentDto,
  UserDetailsDto,
} from '@h2-trust/api';
import { ProcessType, TransportMode } from '@h2-trust/domain';
import { UserService } from '../user/user.service';
import { RedComplianceService } from './red-compliance/red-compliance.service';

@Injectable()
export class BottlingService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy,
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly userService: UserService,
    private readonly redComplianceService: RedComplianceService,
  ) { }

  async createBottling(dto: BottlingDto, files: Express.Multer.File[], userId: string): Promise<BottlingOverviewDto> {
    const baseBottling = BottlingDto.toEntity({ ...dto, recordedBy: userId });
    const createdBottling: ProcessStepEntity = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.CREATE_HYDROGEN_BOTTLING, {
        processStepEntity: baseBottling,
        files,
      }),
    );

    if (createdBottling.transportationDetails) {
      const message = `ProcessStep [${createdBottling.id}] of type [${createdBottling.type}] should not have transportation details upon creation.`;
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }

    const payload = {
      processStepEntity: baseBottling,
      predecessorBatch: createdBottling.batch,
      transportationDetails: this.buildTransportationDetails(dto),
    };
    return firstValueFrom(this.batchSvc.send(ProcessStepMessagePatterns.CREATE_HYDROGEN_TRANSPORTATION, payload)).then(
      BottlingOverviewDto.fromEntity,
    );
  }

  async readBottlingsByCompany(userId: string): Promise<BottlingOverviewDto[]> {
    const userDetailsDto: UserDetailsDto = await this.userService.readUserWithCompany(userId);

    const payload: ReadProcessStepsPayload = ReadProcessStepsPayload.of(
      [ProcessType.HYDROGEN_BOTTLING, ProcessType.HYDROGEN_TRANSPORTATION],
      undefined,
      true,
      userDetailsDto.company.id,
    );
    return firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.READ_ALL, payload),
    ).then(
      (processSteps) => processSteps.map(BottlingOverviewDto.fromEntity)
    );
  }

  async readGeneralInformation(processStepId: string): Promise<GeneralInformationDto> {
    const processStep: ProcessStepEntity = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.READ_UNIQUE, { processStepId }),
    );

    if (processStep.type != ProcessType.HYDROGEN_BOTTLING && processStep.type != ProcessType.HYDROGEN_TRANSPORTATION) {
      const errorMessage = `ProcessStep with ID ${processStepId} should be of type ${ProcessType.HYDROGEN_BOTTLING} or ${ProcessType.HYDROGEN_TRANSPORTATION}, but is ${processStep.type}`;
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const generalInformationDto = GeneralInformationDto.fromEntityToDto(processStep);
    generalInformationDto.producer = await this.fetchProducerName(generalInformationDto.producer);
    generalInformationDto.hydrogenComposition = await this.fetchHydrogenComposition(processStep);
    const redCompliance = await this.redComplianceService.determineRedCompliance(processStepId);
    return { ...generalInformationDto, redCompliance: redCompliance };
  }

  private buildTransportationDetails(dto: BottlingDto): TransportationDetailsEntity {
    let transportationDetails: TransportationDetailsEntity;

    switch (dto.transportMode) {
      case TransportMode.TRAILER:
        if (!dto.distance) {
          const message = `Distance is required for transport mode [${TransportMode.TRAILER}].`;
          throw new HttpException(message, HttpStatus.BAD_REQUEST);
        }
        if (!dto.fuelType) {
          const message = `Fuel type is required for transport mode [${TransportMode.TRAILER}].`;
          throw new HttpException(message, HttpStatus.BAD_REQUEST);
        }
        transportationDetails = new TransportationDetailsEntity(
          undefined,
          dto.distance,
          dto.transportMode,
          dto.fuelType,
        );
        break;
      case TransportMode.PIPELINE:
        transportationDetails = new TransportationDetailsEntity(undefined, 0, dto.transportMode, undefined);
        break;
      default: {
        const message = `Invalid transport mode: ${dto.transportMode}`;
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }
    }

    return transportationDetails;
  }

  private async fetchProducerName(producerId: string): Promise<string> {
    const producer: UserDetailsDto = await firstValueFrom(
      this.generalSvc.send(UserMessagePatterns.READ, ReadByIdPayload.of(producerId)),
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
      this.batchSvc.send(ProcessStepMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION, processStepId),
    );

    return hydrogenComposition.map(HydrogenComponentDto.of);
  }
}
