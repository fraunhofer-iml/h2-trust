import { Controller, Get, NotImplementedException, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { KeycloakUser } from 'nest-keycloak-connect';
import { BatchDto, PaginatedDataDto, type AuthenticatedKCUser } from '@h2-trust/contracts/dtos';
import { UnitType } from '@h2-trust/domain';

@Controller('batches')
export class BatchController {
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
    enum: UnitType,
    example: UnitType.BOTTLING,
    description: 'Used to filter for a specific batch type',
    required: false,
  })
  readAllHydrogenBatches(
    @Query('pageNumber') _pageNumber: number,
    @Query('pageSize') _pageSize: number,
    @Query('id') _from: string,
    @Query('batchType') _to: UnitType,
    @KeycloakUser() _authenticatedUser: AuthenticatedKCUser,
  ): Promise<PaginatedDataDto<BatchDto>> {
    throw new NotImplementedException();
  }
}
