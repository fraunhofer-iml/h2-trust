import { Controller, Get, NotImplementedException, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
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
  @ApiOkResponse({
    description: "Retrieve all hydrogen batches for the authenticated user's company.",
    type: [PaginatedDataDto<BatchDto>],
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
    @Query('pageNumber') pageNumber: number,
    @Query('pageSize') pageSize: number,
    @Query('id') from: string,
    @Query('batchType') to: UnitType,
    @KeycloakUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<PaginatedDataDto<BatchDto>> {
    console.log(
      `Retrieving batches for user ${authenticatedUser.sub} with filters - pageNumber: ${pageNumber}, pageSize: ${pageSize}, id: ${from}, batchType: ${to}`,
    );
    throw new NotImplementedException();
  }
}
