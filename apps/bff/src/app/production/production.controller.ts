/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from 'nest-keycloak-connect';
import { Body, Controller, Get, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  CreateProductionDto,
  ImportSubmissionDto,
  ProcessedCsvDto,
  ProductionCSVUploadDto,
  ProductionOverviewDto,
  VerifyCsvDocumentIntegrityDto,
  VerifyCsvDocumentIntegrityResultDto,
  type AuthenticatedKCUser,
} from '@h2-trust/api';
import { FileUploadKeys } from '@h2-trust/domain';
import { ProductionService } from './production.service';

@Controller('productions')
export class ProductionController {
  constructor(private readonly service: ProductionService) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create power and hydrogen process steps.',
  })
  @ApiCreatedResponse({
    description: 'Returns the newly created power and hydrogen process steps.',
    type: [ProductionOverviewDto],
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        hydrogenProductionUnitId: {
          type: 'string',
          default: 'hydrogen-production-unit-1',
        },
        powerProductionUnitId: {
          type: 'string',
          default: 'power-production-unit-1',
        },
        hydrogenStorageUnitId: {
          type: 'string',
          default: 'hydrogen-storage-unit-1',
        },
        productionStartedAt: {
          type: 'string',
          default: '2025-01-01T10:00:00Z',
        },
        productionEndedAt: {
          type: 'string',
          default: '2025-01-01T11:00:00Z',
        },
        hydrogenAmountKg: {
          type: 'number',
          default: 5,
        },
        powerAmountKwh: {
          type: 'number',
          default: 10,
        },
      },
    },
  })
  async createProductions(
    @Body() dto: CreateProductionDto,
    @AuthenticatedUser() user: AuthenticatedKCUser,
  ): Promise<ProductionOverviewDto[]> {
    return this.service.createProductions(dto, user.sub);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    description: "Retrieve all hydrogen productions for the authenticated user's company.",
  })
  @ApiOkResponse({
    description: "Returns a list of all hydrogen productions belonging to the authenticated user's company.",
    type: [ProductionOverviewDto],
  })
  async readHydrogenProductionsByOwner(
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<ProductionOverviewDto[]> {
    return this.service.readHydrogenProductionsByOwner(authenticatedUser.sub);
  }

  @Get('csv')
  @ApiBearerAuth()
  @ApiOperation({
    description: "Retrieve all csv documents for the authenticated user's company.",
  })
  async readCsvDocumentsByCompany(
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<ProcessedCsvDto[]> {
    return this.service.readCsvDocumentsByCompany(authenticatedUser.sub);
  }

  @Post('csv/import')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: FileUploadKeys.POWER_PRODUCTION }, { name: FileUploadKeys.HYDROGEN_PRODUCTION }]),
  )
  importCsvFile(
    @Body() dto: ProductionCSVUploadDto,
    @UploadedFiles()
    files: {
      [FileUploadKeys.POWER_PRODUCTION]: Express.Multer.File[];
      [FileUploadKeys.HYDROGEN_PRODUCTION]: Express.Multer.File[];
    },
    @AuthenticatedUser() user: AuthenticatedKCUser,
  ) {
    return this.service.importCsvFiles(
      files[FileUploadKeys.POWER_PRODUCTION],
      files[FileUploadKeys.HYDROGEN_PRODUCTION],
      dto,
      user.sub,
    );
  }

  @Post('csv/submit')
  @ApiBearerAuth()
  submitCsvData(@Body() dto: ImportSubmissionDto, @AuthenticatedUser() user: AuthenticatedKCUser) {
    return this.service.submitCsvData(dto, user.sub);
  }

  @Post('csv/verify')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Verify csv document integrity against the blockchain proof and return structured result details.',
  })
  @ApiOkResponse({
    description: 'Returns verification status and technical details for the details pane.',
    type: VerifyCsvDocumentIntegrityResultDto,
  })
  verifyCsvDocumentIntegrity(@Body() dto: VerifyCsvDocumentIntegrityDto): Promise<VerifyCsvDocumentIntegrityResultDto> {
    return this.service.verifyCsvDocumentIntegrity(dto);
  }
}
