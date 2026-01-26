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
  ProductPassportDto,
  type AuthenticatedKCUser,
} from '@h2-trust/api';
import 'multer';
import { AuthenticatedUser, Public } from 'nest-keycloak-connect';
import { BottlingService } from './bottling.service';

@Controller('bottlings')
export class BottlingController {
  constructor(private readonly bottlingService: BottlingService) {}

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
  async readBottlingsAndTransportationsByCompany(
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<BottlingOverviewDto[]> {
    return this.bottlingService.readBottlingsAndTransportationsByCompany(authenticatedUser.sub);
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
    type: ProductPassportDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the transportation process step.',
    example: 'process-step-hydrogen-bottling-1',
  })
  async readProductPassport(@Param('id') id: string): Promise<ProductPassportDto> {
    return this.bottlingService.readProductPassport(id);
  }
}
