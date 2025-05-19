import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CompanyDto } from '@h2-trust/api';
import { CompanyService } from './company.service';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOperation({ description: 'Get all available Companies' })
  findAll(): CompanyDto[] {
    return this.companyService.findAll();
  }
}
