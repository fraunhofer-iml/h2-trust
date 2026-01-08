/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Body, Controller, Get, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import {
  BottlingDto,
  BottlingDtoMock,
  BottlingOverviewDto,
  GeneralInformationDto,
  ProofOfSustainabilityDto,
  SectionDto,
  type AuthenticatedKCUser,
} from '@h2-trust/api';
import { BottlingService } from './bottling.service';
import 'multer';
import { AuthenticatedUser, Public } from 'nest-keycloak-connect';
import { DigitalProductPassportService } from './digital-product-passport/digital-product-passport.service';

@Controller('bottlings')
export class BottlingController {
  constructor(
    private readonly bottlingService: BottlingService,
    private readonly digitalProductPassportService: DigitalProductPassportService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create a new bottling process step with multiple file uploads and related metadata.',
  })
  @ApiCreatedResponse({
    description: 'Returns the newly created bottling process step.',
    type: BottlingOverviewDto,
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
          default: BottlingDtoMock[0].amount,
        },
        color: {
          type: 'string',
          default: BottlingDtoMock[0].color,
        },
        recipient: {
          type: 'string',
          default: BottlingDtoMock[0].recipient,
        },
        filledAt: {
          type: 'string',
          default: BottlingDtoMock[0].filledAt,
        },
        recordedBy: {
          type: 'string',
          default: BottlingDtoMock[0].recordedBy,
        },
        hydrogenStorageUnit: {
          type: 'string',
          default: BottlingDtoMock[0].hydrogenStorageUnit,
        },
        fileDescription: {
          type: 'string',
          default: BottlingDtoMock[0].fileDescription,
        },
        transportMode: {
          type: 'string',
          default: BottlingDtoMock[0].transportMode,
        },
        distance: {
          type: 'number',
          default: BottlingDtoMock[0].distance,
        },
        fuelType: {
          type: 'string',
          default: BottlingDtoMock[0].fuelType,
        },
      },
    },
  })
  async createBottlingAndTransportation(
    @Body() dto: BottlingDto,
    @UploadedFiles() files: Express.Multer.File[],
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<BottlingOverviewDto> {
    return this.bottlingService.createBottlingAndTransportation(dto, files, authenticatedUser.sub);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    description: "Retrieve all bottling process steps for the authenticated user's company.",
  })
  @ApiOkResponse({
    description: "Returns a list of all bottling process steps belonging to the authenticated user's company.",
    type: [BottlingOverviewDto],
  })
  async readBottlingsByCompany(
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<BottlingOverviewDto[]> {
    return this.bottlingService.readBottlingsByCompany(authenticatedUser.sub);
  }

  @Public()
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve the general information by the corresponding bottling process step ID.',
  })
  @ApiOkResponse({
    description: 'Returns the requested general information of a bottling.',
    type: GeneralInformationDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the bottling process step.',
    example: 'process-step-hydrogen-bottling-1',
  })
  async readGeneralInformation(@Param('id') processStepId: string): Promise<GeneralInformationDto> {
    return this.digitalProductPassportService.readGeneralInformation(processStepId);
  }

  @Public()
  @Get(':id/proof-of-origin')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve the proof of origin by the corresponding process-step ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the process-step.',
    example: 'process-step-hydrogen-bottling-2',
  })
  readProofOfOrigin(@Param('id') processStepId: string): Promise<SectionDto[]> {
    return this.digitalProductPassportService.buildProofOfOrigin(processStepId);
  }

  @Public()
  @Get(':id/proof-of-sustainability')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve the proof of sustainability by the corresponding process-step ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the process-step.',
    example: 'process-step-hydrogen-bottling-2',
  })
  readProofOfSustainability(@Param('id') processStepId: string): Promise<ProofOfSustainabilityDto> {
    return this.digitalProductPassportService.buildProofOfSustainability(processStepId);
  }
}
