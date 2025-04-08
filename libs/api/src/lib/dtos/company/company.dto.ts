import { AddressDto } from '../address';
import { UserDto } from '../user';

export class CompanyDto {
  id: string;
  name: string;
  mastrNumber: string;
  companyType: string;
  address: AddressDto;
  users: UserDto[];

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    companyType: string,
    address: AddressDto,
    users: UserDto[],
  ) {
    this.id = id;
    this.name = name;
    this.mastrNumber = mastrNumber;
    this.companyType = companyType;
    this.address = address;
    this.users = users;
  }
}
