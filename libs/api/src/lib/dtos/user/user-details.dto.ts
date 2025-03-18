import { CompanyDto } from '../company';
import { UserDto } from './user.dto';

export class UserDetailsDto extends UserDto {
  company: CompanyDto;

  constructor(id: string, name: string, email: string, company: CompanyDto) {
    super(id, name, email);
    this.company = company;
  }
}
