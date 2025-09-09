import { CompanyRepository } from 'libs/database/src/lib';
import { Injectable } from '@nestjs/common';
import { CompanyEntity } from '@h2-trust/amqp';

@Injectable()
export class CompanyService {
  constructor(private readonly repository: CompanyRepository) {}

  async findAll(): Promise<CompanyEntity[]> {
    return this.repository.findAll();
  }
}
