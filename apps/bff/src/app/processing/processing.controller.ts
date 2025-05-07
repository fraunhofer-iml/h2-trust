import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { BottlingDto, ProcessingOverviewDto, ProcessStepDto } from '@h2-trust/api';
import { ProcessingService } from './processing.service';
import 'multer';

@Controller('processing')
export class ProcessingController {
  constructor(private processingService: ProcessingService) {}

  @Get()
  @ApiOperation({ description: 'Get all processing batches' })
  @ApiOkResponse({ description: 'Successful request.' })
  @ApiResponse({ type: [ProcessingOverviewDto] })
  @ApiQuery({
    name: 'processTypeName',
    required: false,
    examples: {
      allBatches: { value: null, description: 'Get all batches' },
      hydrogenProduction: { value: 'HYDROGEN_PRODUCTION', description: 'Get all batches from hydrogen production' },
      bottling: { value: 'BOTTLING', description: 'Get all batches from bottling' },
    },
  })
  @ApiQuery({
    name: 'active',
    required: false,
    default: true,
    examples: {
      allBatches: { value: null, description: 'Get all batches' },
      activeBatches: { value: true, description: 'Get all active batches' },
    },
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    examples: {
      allBatches: { value: null, description: 'Get batches from all companies' },
      companyHydrogen: { value: 'company-hydrogen-1', description: 'Get batches from one hydrogen company' },
    },
  })
  async readProcessing(
    @Query('processTypeName') processTypeName: string,
    @Query('active') active: boolean,
    @Query('companyId') companyId: string,
  ): Promise<ProcessingOverviewDto[]> {
    return this.processingService.readProcessing(processTypeName, active, companyId);
  }

  @Post('bottling')
  @ApiOperation({ description: 'Create process step for bottling' })
  @ApiCreatedResponse({ description: 'Successful creation.' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async executeBottling(@Body() dto: BottlingDto, @UploadedFile() file: Express.Multer.File): Promise<ProcessStepDto> {
    return this.processingService.executeBottling(dto, file);
  }
}
