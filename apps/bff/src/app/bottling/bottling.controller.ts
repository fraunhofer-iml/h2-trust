/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Body, Controller, Get, Logger, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
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
  ProductPassDto,
  ProofOfSustainabilityDto,
  proofOfSustainabilityMock,
  SectionDto,
  type AuthenticatedKCUser,
} from '@h2-trust/api';
import { BottlingService } from './bottling.service';
import 'multer';
import { AuthenticatedUser, Public } from 'nest-keycloak-connect';
import { ProofOfOriginService } from './proof-of-origin/proof-of-origin.service';

@Controller('bottlings')
export class BottlingController {
  private readonly logger: Logger = new Logger(BottlingController.name);

  constructor(
    private readonly bottlingService: BottlingService,
    private readonly proofOfOriginService: ProofOfOriginService,
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
        fuelType: {
          type: 'string',
          default: BottlingDtoMock[0].fuelType,
        },
      },
    },
  })
  async createBottling(
    @Body() dto: BottlingDto,
    @UploadedFiles() files: Express.Multer.File[],
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<BottlingOverviewDto> {
    return this.bottlingService.createBottling(dto, files, authenticatedUser.sub);
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
    description: 'Retrieve the product pass by the corresponding bottling process step ID.',
  })
  @ApiOkResponse({
    description: 'Returns the requested product pass.',
    type: ProductPassDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the bottling process step.',
    example: 'process-step-hydrogen-bottling-1',
  })
  async readGeneralInformation(@Param('id') processStepId: string): Promise<ProductPassDto> {
    return this.bottlingService.readGeneralInformation(processStepId);
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
    return this.proofOfOriginService.readProofOfOrigin(processStepId);
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
  readProofOfSustainability(@Param('id') processStepId: string): ProofOfSustainabilityDto {
    this.logger.log(`Read Proof of Sustainability for Process Stem ${processStepId}`);
    return proofOfSustainabilityMock;
  }
}
