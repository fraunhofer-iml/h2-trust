/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from 'nest-keycloak-connect';
import {
  Body,
  Controller,
  Get,
  NotImplementedException,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateProductionDto,
  CsvDocumentIntegrityResultDto,
  PaginatedProductionDataDto,
  ProcessedCsvDto,
  ProductionCSVUploadDto,
  ProductionOverviewDto,
  ProductionStatisticsDto,
  StagedProductionDto,
  StagingSubmissionDto,
  type AuthenticatedKCUser,
  type CsvContentType,
} from '@h2-trust/api';
import { BatchType } from '@h2-trust/domain';
import { ProductionService } from './production.service';

@Controller('productions')
export class ProductionController {
  constructor(private readonly service: ProductionService) {}

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
    name: 'unitName',
    type: String,
    description: 'Used to filter for a specific hydrogen-production unit',
    required: false,
    example: 'Hydrogen Electrolyzer Dortmund 001',
  })
  @ApiQuery({
    name: 'month',
    type: Date,
    description: 'Used to filter for a specific time period, in this case month and year',
    required: false,
    example: '2024-09-20T07:55:55.695Z',
  })
  async readHydrogenProductionsByOwner(
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
    @Query('pageNumber') pageNumber: number,
    @Query('pageSize') pageSize: number,
    @Query('unitName') unitName: string,
    @Query('month') month: Date,
  ): Promise<PaginatedProductionDataDto> {
    return this.service.readHydrogenProductionsByOwner(authenticatedUser.sub, pageNumber, pageSize, unitName, month);
  }

  @Get('/statistics')
  @ApiBearerAuth()
  @ApiOperation({
    description:
      "Retrieve statistics for all hydrogen productions for the authenticated user's company in the selected month for the specified unit.",
  })
  @ApiOkResponse({
    description:
      "Returns a list of all statistics for all hydrogen productions for the authenticated user's company in the selected month for the specified unit.",
    type: [ProductionStatisticsDto],
  })
  @ApiQuery({
    name: 'month',
    type: Date,
    description:
      'Statistics period (YYYY-MM-DD). Only year and month are evaluated; day is ignored. Defaults to current month.',
    required: false,
  })
  @ApiQuery({
    name: 'unitName',
    type: String,
    description: 'Search by production unit name or ID. Omit for all units',
    required: false,
  })
  assembleHydrogenProductionsStatisticsByOwner(
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
    @Query('month') month: Date,
    @Query('unitName') unitName: string,
  ): Promise<ProductionStatisticsDto> {
    return this.service.assembleHydrogenProductionStatistics(authenticatedUser.sub, unitName, month);
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

  @Get('staging')
  @ApiBearerAuth()
  @ApiOperation({
    description: "Retrieve all staged productions for the authenticated user's company.",
  })
  @ApiQuery({
    name: 'scope',
    description: 'Search by staged production owner',
    required: false,
  })
  @ApiQuery({
    name: 'type',
    description: 'Search by csv content type (hydrogen or power)',
    required: false,
  })
  @ApiQuery({
    name: 'from',
    description: 'Start date of searched period',
    required: false,
  })
  @ApiQuery({
    name: 'to',
    description: 'end date of searched period',
    required: false,
  })
  async readStagedProductionsByCompanyAndType(
    @Query('scope') _scope: 'own' | 'received',
    @Query('type') _type: CsvContentType,
    @Query('from') _from: Date,
    @Query('to') _to: Date,
    @AuthenticatedUser() _authenticatedUser: AuthenticatedKCUser,
  ): Promise<StagedProductionDto[]> {
    return [
      {
        id: 'staging-id-1',
        amountProduced: 120,
        csvContentType: BatchType.POWER,
        endedAt: new Date(),
        productionUnitId: 'power-production-unit-1',
        startedAt: new Date(),
        uploadedBy: 'test',
        amountConsumed: 30,
      },
    ];
  }

  @Get('csv/:id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Verify csv document integrity against the blockchain proof and return structured result details.',
  })
  @ApiOkResponse({
    description: 'Returns verification status and technical details for the details pane.',
    type: CsvDocumentIntegrityResultDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the CSV document to verify.',
    example: '019c9492-adaa-7843-88db-2faaeea0de05',
  })
  verifyCsvDocumentIntegrity(@Param('id') id: string): Promise<CsvDocumentIntegrityResultDto> {
    return this.service.verifyCsvDocumentIntegrity(id);
  }

  @Post('csv/import')
  @UseInterceptors(FilesInterceptor('files'))
  importCsvFile(
    @Body() dto: ProductionCSVUploadDto,
    @UploadedFiles()
    files: Express.Multer.File[] | Express.Multer.File,
    @AuthenticatedUser() user: AuthenticatedKCUser,
  ) {
    // TODO-LG: adjust this endpoint (DUHGW-421)
    return this.service.importCsvFiles(files, files, dto, user.sub);
  }

  @Post('staging/submit')
  @ApiBearerAuth()
  submitCsvData(@Body() _dto: StagingSubmissionDto, @AuthenticatedUser() _user: AuthenticatedKCUser) {
    throw new NotImplementedException();
  }
}
