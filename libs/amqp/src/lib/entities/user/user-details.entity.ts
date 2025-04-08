import { CompanyEntity } from '../company';
import { UserEntity } from './user.entity';

export class UserDetailsEntity extends UserEntity {
  company: CompanyEntity;

  constructor(id: string, name: string, email: string, company: CompanyEntity) {
    super(id, name, email);
    this.company = company;
  }
}
