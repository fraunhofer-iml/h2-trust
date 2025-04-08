import { AddressEntity } from '../address';
import { UserEntity } from '../user';

export class CompanyEntity {
  id: string;
  name: string;
  mastrNumber: string;
  companyType: string;
  address?: AddressEntity;
  users?: UserEntity[];

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    companyType: string,
    address: AddressEntity,
    users: UserEntity[],
  ) {
    this.id = id;
    this.name = name;
    this.mastrNumber = mastrNumber;
    this.companyType = companyType;
    this.address = address;
    this.users = users;
  }
}
