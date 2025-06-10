import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  AuthenticatedKCUser,
  BottlingDto,
  BottlingDtoMock,
  ProcessingOverviewDto,
  ProcessStepDto,
  ProcessType,
  ProductionOverviewDto,
} from '@h2-trust/api';
import { ProcessStepService } from './process-step.service';
import 'multer';
import { AuthenticatedUser } from 'nest-keycloak-connect';

// TODO-MP(DUHGW-106): since the bff is view-based, we should not use the ProcessStepController for the API, because it's not a view but rather an implementation detail.
// Instead, we should rename this controller to BottlingController and split the readProcessSteps method into two separate methods: readProduction and readBottling.
// The readProduction method should then be moved to the ProductionController.
@Controller('process-steps')
export class ProcessStepController {
  constructor(private readonly service: ProcessStepService) {}

  @Get()
  @ApiOperation({ description: 'Get either all production batches or processing batches' })
  @ApiOkResponse({ description: 'Successful request.' })
  @ApiQuery({
    name: 'companyId',
    required: false,
    examples: {
      allBatches: {
        value: null,
        description: 'Get all production/processing batches from all companies',
      },
      companyHydrogen: {
        value: 'company-hydrogen-1',
        description: 'Get all production/processing batches from one hydrogen company',
      },
    },
  })
  @ApiQuery({
    name: 'processType',
    required: true,
    examples: {
      hydrogenProduction: {
        value: ProcessType.HYDROGEN_PRODUCTION,
        description: 'Get hydrogen production batches',
      },
      bottling: {
        value: ProcessType.BOTTLING,
        description: 'Get bottled batches',
      },
    },
  })
  async readProcessSteps(
    @Query('processType') processType: ProcessType,
    @AuthenticatedUser() user: AuthenticatedKCUser,
  ): Promise<ProductionOverviewDto[] | ProcessingOverviewDto[]> {
    switch (processType) {
      case ProcessType.HYDROGEN_PRODUCTION:
        return this.service.readProduction(user.sub);
      case ProcessType.BOTTLING:
        return this.service.readProcessing(user.sub);
      default:
        throw new HttpException(`Unknown processType '${processType}'`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @ApiOperation({ description: 'Create process step for bottling' })
  @ApiCreatedResponse({ description: 'Successful creation.' })
  @UseInterceptors(FileInterceptor('file'))
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
          type: 'string',
          default: BottlingDtoMock[0].amount,
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
  async executeBottling(
    @Body() dto: BottlingDto,
    @UploadedFile() file: Express.Multer.File,
    @AuthenticatedUser() user: AuthenticatedKCUser,
  ): Promise<ProcessStepDto> {
    return this.service.executeBottling(dto, file, user.sub);
  }
}
