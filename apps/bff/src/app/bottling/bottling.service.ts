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
  GeneralInformationEntity,
  DigitalProductPassportPatterns,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEntity,
  ReadByIdPayload,
  ReadProcessStepsByTypesAndActiveAndCompanyPayload,
} from '@h2-trust/amqp';
import {
  BottlingDto,
  BottlingOverviewDto,
  GeneralInformationDto,
  ProofOfSustainabilityDto,
  SectionDto,
} from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
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
      dto.fileDescription,
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

  async readBottlingsAndTransportationsByCompany(userId: string): Promise<BottlingOverviewDto[]> {
    const userDetails = await this.userService.readUserWithCompany(userId);

    const payload = new ReadProcessStepsByTypesAndActiveAndCompanyPayload(
      [ProcessType.HYDROGEN_BOTTLING, ProcessType.HYDROGEN_TRANSPORTATION],
      true,
      userDetails.company.id,
    );

    const bottlingsAndTransportations: ProcessStepEntity[] = await firstValueFrom(
      this.processSvc.send(ProcessStepMessagePatterns.READ_ALL_BY_TYPES_AND_ACTIVE_AND_COMPANY, payload),
    );
    return bottlingsAndTransportations.map(BottlingOverviewDto.fromEntity);
  }

  async readGeneralInformation(id: string): Promise<GeneralInformationDto> {
    const generalInformation: GeneralInformationEntity = await firstValueFrom(
      this.processSvc.send(DigitalProductPassportPatterns.READ_GENERAL_INFORMATION, new ReadByIdPayload(id)),
    );
    return GeneralInformationDto.fromEntity(generalInformation);
  }

  async readProofOfOrigin(id: string): Promise<SectionDto[]> {
    const proofOfOrigin: ProofOfOriginSectionEntity[] = await firstValueFrom(
      this.processSvc.send(DigitalProductPassportPatterns.READ_PROOF_OF_ORIGIN, new ReadByIdPayload(id)),
    );
    return SectionDto.fromEntities(proofOfOrigin);
  }

  async readProofOfSustainability(id: string): Promise<ProofOfSustainabilityDto> {
    const proofOfSustainability: ProofOfSustainabilityEntity = await firstValueFrom(
      this.processSvc.send(DigitalProductPassportPatterns.READ_PROOF_OF_SUSTAINABILITY, new ReadByIdPayload(id)),
    );
    return ProofOfSustainabilityDto.fromEntity(proofOfSustainability);
  }
}
