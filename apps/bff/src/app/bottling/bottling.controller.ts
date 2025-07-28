import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  type AuthenticatedKCUser,
} from '@h2-trust/api';
import { BottlingService } from './bottling.service';
import 'multer';
import { AuthenticatedUser } from 'nest-keycloak-connect';

@Controller('bottlings')
export class BottlingController {
  constructor(private readonly service: BottlingService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create a new bottling process step with file upload and related metadata.',
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
        file: {
          type: 'string',
          format: 'binary',
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
      },
    },
  })
  async createBottling(
    @Body() dto: BottlingDto,
    @UploadedFile() file: Express.Multer.File,
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<BottlingOverviewDto> {
    return this.service.createBottling(dto, file, authenticatedUser.sub);
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
    return this.service.readBottlingsByCompany(authenticatedUser.sub);
  }

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
  async readProductPass(@Param('id') processStepId: string): Promise<ProductPassDto> {
    return this.service.readProductPass(processStepId);
  }
}
