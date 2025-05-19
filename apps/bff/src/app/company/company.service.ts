import { Injectable } from '@nestjs/common';
import { CompanyDto, CompanyDtoMock } from '@h2-trust/api';

@Injectable()
export class CompanyService {
  //MA/MP need to be implemented and decided which companies qualifies as recipients
  findAll(): CompanyDto[] {
    return CompanyDtoMock;
  }
}
