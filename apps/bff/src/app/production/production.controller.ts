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
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import {
  CsvDocumentIntegrityResultDto,
  PaginatedProductionDataDto,
  ProcessedCsvDto,
  ProductionCSVUploadDto,
  ProductionOverviewDto,
  ProductionStatisticsDto,
  StagedProductionDto,
  StagingSubmissionDto,
  type AuthenticatedKCUser,
} from '@h2-trust/api';
import { CsvContentType, StagingScope } from '@h2-trust/domain';
import { ProductionService } from './production.service';

@Controller('productions')
export class ProductionController {
  constructor(private readonly service: ProductionService) {}

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

  @Get('pending/csv')
  @ApiBearerAuth()
  @ApiOperation({
    description: "Retrieve all uploaded csv documents for the authenticated user's company.",
  })
  async readCsvDocumentsByCompany(
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<ProcessedCsvDto[]> {
    return this.service.readCsvDocumentsByCompany(authenticatedUser.sub);
  }

  @Get('pending')
  @ApiBearerAuth()
  @ApiOperation({
    description: "Retrieve all staged productions for the authenticated user's company.",
  })
  @ApiQuery({
    name: 'scope',
    description: 'Search by staged production owner',
    required: false,
    example: StagingScope.OWN,
    enum: StagingScope,
  })
  @ApiQuery({
    name: 'type',
    description: 'Search by csv content type (hydrogen or power)',
    required: false,
    enum: CsvContentType,
    example: CsvContentType.POWER,
  })
  @ApiQuery({
    name: 'from',
    description: 'Start date of searched period',
    required: false,
    type: Date,
    example: new Date('2026-01-01'),
  })
  @ApiQuery({
    name: 'to',
    description: 'end date of searched period',
    required: false,
    type: Date,
    example: new Date('2026-02-01'),
  })
  async readStagedProductionsByCompanyAndType(
    @Query('scope') _scope: StagingScope,
    @Query('type') _type: CsvContentType,
    @Query('from') _from: Date,
    @Query('to') _to: Date,
    @AuthenticatedUser() _authenticatedUser: AuthenticatedKCUser,
  ): Promise<StagedProductionDto[]> {
    return this.service.readStagedHydrogenProductionsByOwner(authenticatedUser.sub, pageNumber, pageSize);
  }

  @Get('pending/csv/:id/verify')
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

  @Post('pending/csv')
  @ApiOperation({
    description: 'Create staged productions by uploading csv files.',
  })
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files'))
  importCsvFile(
    @Body() _dto: ProductionCSVUploadDto,
    @UploadedFiles()
    _files: Express.Multer.File[] | Express.Multer.File,
    @AuthenticatedUser() _user: AuthenticatedKCUser,
  ) {
    return this.service.importCsvFiles(_files, _dto, _user.sub);
  }

  @Post()
  @ApiOperation({
    description: 'Create production process steps by finalizing the staged productions.',
  })
  @ApiBearerAuth()
  createProductionsFromStaging(@Body() _dto: StagingSubmissionDto, @AuthenticatedUser() _user: AuthenticatedKCUser) {
    //TODO-LG: Implement finalize functionality (DUHGW-425)
    throw new NotImplementedException();
  }
}
