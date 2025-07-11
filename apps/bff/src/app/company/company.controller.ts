import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CompanyDto } from '@h2-trust/api';
import { CompanyService } from './company.service';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve all companies.',
  })
  @ApiOkResponse({
    description: 'Returns a list of all companies.',
    type: [CompanyDto],
  })
  async findAll(): Promise<CompanyDto[]> {
    return this.companyService.findAll();
  }
}
