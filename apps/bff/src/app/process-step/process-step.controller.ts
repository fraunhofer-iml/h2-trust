/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Body, Controller, Get, Param, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  BatchDto,
  CreateProcessStepDto,
  DigitalProductPassportDto,
  HydrogenComponentDto,
  PaginatedDataDto,
  ProcessStepOverviewDto,
  type AuthenticatedKCUser,
} from '@h2-trust/contracts/dtos';
import 'multer';
import { KeycloakUser, Public } from 'nest-keycloak-connect';
import { ProcessType } from '@h2-trust/domain';
import { ProcessStepService } from './process-step.service';

const bottlingExampleDefaults = {
  amount: 1,
  rfnboType: 'RFNBO_READY',
  recipient: 'company-recipient-1',
  filledAt: '2025-04-07T00:00:00.000Z',
  recordedBy: 'user-id-1',
  hydrogenStorageUnit: 'hydrogen-storage-unit-1',
  transportMode: 'TRAILER',
  distance: 1000,
  fuelType: 'DIESEL',
} as const;

//TODO-LG: rename Bottling classes to ProcessStep
@Controller('process-steps')
export class ProcessStepController {
  constructor(private readonly processStepService: ProcessStepService) {}

  //TODO-LG: update swagger annotation
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create a new process step with multiple file uploads and related metadata.',
  })
  @ApiCreatedResponse({
    description: 'Returns the newly created process step.',
    type: ProcessStepOverviewDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        amount: {
          type: 'number',
          default: bottlingExampleDefaults.amount,
        },
        rfnboType: {
          type: 'string',
          default: bottlingExampleDefaults.rfnboType,
        },
        recipient: {
          type: 'string',
          default: bottlingExampleDefaults.recipient,
        },
        filledAt: {
          type: 'string',
          default: bottlingExampleDefaults.filledAt,
        },
        recordedBy: {
          type: 'string',
          default: bottlingExampleDefaults.recordedBy,
        },
        hydrogenStorageUnit: {
          type: 'string',
          default: bottlingExampleDefaults.hydrogenStorageUnit,
        },
        transportMode: {
          type: 'string',
          default: bottlingExampleDefaults.transportMode,
        },
        distance: {
          type: 'number',
          default: bottlingExampleDefaults.distance,
        },
        fuelType: {
          type: 'string',
          default: bottlingExampleDefaults.fuelType,
        },
      },
    },
  })
  createBottlingAndTransportation(
    @Body() dto: CreateProcessStepDto,
    @UploadedFiles() files: Express.Multer.File[],
    @KeycloakUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<ProcessStepOverviewDto> {
    return this.processStepService.createProcessStep(dto, files, authenticatedUser.sub);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    description: "Retrieve all hydrogen batches for the authenticated user's company.",
  })
  @ApiQuery({
    name: 'pageNumber',
    type: Number,
    description: 'Used to get a specific page of pagination',
    required: false,
    minimum: 1,
    example: '1',
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    description: 'Used to define the amount of data retrieved',
    required: false,
    minimum: 5,
    example: '5',
  })
  @ApiQuery({
    name: 'id',
    type: String,
    description: 'Used to filter for a specific batch by its id',
    required: false,
    example: 'Hydrogen Electrolyzer Dortmund 001',
  })
  @ApiQuery({
    name: 'batchType',
    enum: ProcessType,
    example: ProcessType.HYDROGEN_PRODUCTION,
    description: 'Used to filter for a specific process type (batch type)',
    required: false,
  })
  readAllHydrogenBatches(
    @Query('pageNumber') pageNumber: number,
    @Query('pageSize') pageSize: number,
    @Query('id') id: string,
    @Query('batchType') batchType: ProcessType,
    @KeycloakUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<PaginatedDataDto<BatchDto>> {
    return this.processStepService.readPaginatedProcessSteps(
      authenticatedUser.sub,
      pageNumber,
      pageSize,
      id,
      batchType,
    );

    // TODO-LG: Implement actual logic to retrieve batches for the authenticated user's company, with pagination and filtering based on the provided query parameters. (DUHGW-470)
    /*
    return new Promise((resolve) => {
      resolve(
        new PaginatedDataDto<BatchDto>(
          [
            new BatchDto(
              'process-step-hydrogen-transportation-2',
              1000,
              new Date(),
              ProcessType.HYDROGEN_BOTTLING,
              RfnboType.RFNBO_READY,
            ),
            new BatchDto(
              'process-step-hydrogen-transportation-1',
              2000,
              new Date(),
              ProcessType.HYDROGEN_PRODUCTION,
              RfnboType.NON_CERTIFIABLE,
            ),
          ],
          2,
          1,
        ),
      );
    });*/
  }

  @Public()
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve the general information by the corresponding transportation process step ID.',
  })
  @ApiOkResponse({
    description:
      'Returns the requested product passport including general information, proof of origin and proof of sustainability of a transportation process step.',
    type: DigitalProductPassportDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the transportation process step.',
    example: 'process-step-hydrogen-bottling-1',
  })
  readDigitalProductPassport(@Param('id') id: string): Promise<DigitalProductPassportDto> {
    return this.processStepService.readDigitalProductPassport(id);
  }

  @Public()
  @Get('components/:id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve a list of hydrogen components by the corresponding unit ID.',
  })
  @ApiOkResponse({
    description: 'Returns a list of hydrogen components for the given unit.',
    type: HydrogenComponentDto,
    isArray: true,
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the unit.',
    example: 'hydrogen-storage-unit-1',
  })
  readHydrogenComponentsForUnit(
    @Param('id') id: string,
    @KeycloakUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<HydrogenComponentDto[]> {
    return this.processStepService.readHydrogenComponentsForUnits([id], authenticatedUser.sub);
  }
}
