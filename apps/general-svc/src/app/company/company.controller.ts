import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CompanyEntity, CompanyMessagePatterns } from '@h2-trust/amqp';
import { CompanyService } from './company.service';

@Controller()
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @MessagePattern(CompanyMessagePatterns.READ_ALL)
  async findAll(): Promise<CompanyEntity[]> {
    return this.service.findAll();
  }
}
