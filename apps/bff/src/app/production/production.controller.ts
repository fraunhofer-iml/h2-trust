/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from 'nest-keycloak-connect';
import { Body, Controller, Get, Param, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
  ImportSubmissionDto,
  PaginatedProductionDataDto,
  ProcessedCsvDto,
  ProductionCSVUploadDto,
  ProductionOverviewDto,
  ProductionStatisticsDto,
  type AuthenticatedKCUser,
} from '@h2-trust/api';
import { FileUploadKeys } from '@h2-trust/domain';
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
  @UseInterceptors(
    FileFieldsInterceptor([{ name: FileUploadKeys.POWER_PRODUCTION }, { name: FileUploadKeys.HYDROGEN_PRODUCTION }]),
  )
  importCsvFile(
    @Body() dto: ProductionCSVUploadDto,
    @UploadedFiles()
    files: {
      [FileUploadKeys.STAGE_PRODUCTION]: Express.Multer.File[];
    },
    @AuthenticatedUser() user: AuthenticatedKCUser,
  ) {
    return this.service.importCsvFiles(files[FileUploadKeys.STAGE_PRODUCTION], dto, user.sub);
  }

  @Post('csv/submit')
  @ApiBearerAuth()
  submitCsvData(@Body() dto: ImportSubmissionDto, @AuthenticatedUser() user: AuthenticatedKCUser) {
    return this.service.submitCsvData(dto, user.sub);
  }
}
