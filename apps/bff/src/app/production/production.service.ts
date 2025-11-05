/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerException,
  BrokerQueues,
  CreateProductionEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ProductionMessagePatterns,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { CreateProductionDto, ProductionCSVUploadDto, ProductionOverviewDto, UserDetailsDto } from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { UserService } from '../user/user.service';

@Injectable()
export class ProductionService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy,
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly userService: UserService,
  ) {}

  async createProduction(dto: CreateProductionDto, userId: string): Promise<ProductionOverviewDto[]> {
    const hydrogenColor = await this.fetchHydrogenColor(dto.powerProductionUnitId);
    const companyIdOfPowerProductionUnit = await this.fetchCompanyOfProductionUnit(dto.powerProductionUnitId);
    const companyIdOfHydrogenProductionUnit = await this.fetchCompanyOfProductionUnit(dto.hydrogenProductionUnitId);

    const createProductionEntity = CreateProductionEntity.of(
      dto,
      userId,
      hydrogenColor,
      companyIdOfPowerProductionUnit,
      companyIdOfHydrogenProductionUnit,
    );

    const processSteps: ProcessStepEntity[] = await firstValueFrom(
      this.processSvc.send(ProductionMessagePatterns.CREATE, { createProductionEntity }),
    );

    return processSteps
      .filter((step) => step.type === ProcessType.HYDROGEN_PRODUCTION)
      .map(ProductionOverviewDto.fromEntity);
  }

  private async fetchHydrogenColor(powerProductionUnitId: string): Promise<string> {
    const powerProductionUnit: PowerProductionUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: powerProductionUnitId }),
    );

    const hydrogenColor = powerProductionUnit?.type?.hydrogenColor;

    if (!hydrogenColor) {
      throw new HttpException(
        `Power Production Unit ${powerProductionUnitId} has no Hydrogen Color`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return hydrogenColor;
  }

  private async fetchCompanyOfProductionUnit(productionUnitId: string): Promise<string> {
    const productionUnitEntity: PowerProductionUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: productionUnitId }),
    );

    if (!productionUnitEntity.company) {
      throw new BrokerException(
        `Production Unit ${productionUnitId} does not have an associated company`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return productionUnitEntity.company.id;
  }

  async readHydrogenProductionsByCompany(userId: string): Promise<ProductionOverviewDto[]> {
    const userDetailsDto: UserDetailsDto = await this.userService.readUserWithCompany(userId);
    const companyIdOfUser = userDetailsDto.company.id;
    const payload = {
      predecessorProcessType: ProcessType.POWER_PRODUCTION,
      companyId: companyIdOfUser,
    };

    return firstValueFrom(this.batchService.send(ProcessStepMessagePatterns.READ_ALL, payload)).then((processSteps) =>
      processSteps.map(ProductionOverviewDto.fromEntity),
    );
  }

  async importCSV(
    powerProductionFiles: Express.Multer.File[],
    hydrogenProductionFiles: Express.Multer.File[],
    dto: ProductionCSVUploadDto,
  ) {
    const missingFiles = [];
    if (!powerProductionFiles || powerProductionFiles.length === 0) missingFiles.push('Power Production');
    if (!hydrogenProductionFiles || hydrogenProductionFiles.length === 0) missingFiles.push('Hydrogen Production');
    if (missingFiles.length > 0) throw new BadRequestException(`Missing Information: ${missingFiles.join(' & ')}.`);

    const missingUnitIds = [];
    if (dto.hydrogenProductionUnitIds.length < hydrogenProductionFiles.length)
      missingUnitIds.push('Hydrogen Production Unit');
    if (dto.powerProductionUnitIds.length < powerProductionFiles.length) missingUnitIds.push('Power Production Unit');
    if (missingUnitIds.length > 0) throw new BadRequestException(`Missing Information: ${missingUnitIds.join(' & ')}.`);
  }
}
