import { Injectable } from '@nestjs/common';
import { CompanyDto, CompanyDtoMock } from '@h2-trust/api';

@Injectable()
export class CompanyService {

  // TODO-MP(DUHGW-130): Implement real company service logic to fetch data from the database or external API.
  findAll(): CompanyDto[] {
    return CompanyDtoMock;
  }
}
