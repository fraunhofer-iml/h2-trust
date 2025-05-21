import { UserDetailsDto } from '..';
import { AddressDto } from '../../address';
import { CompanyDto } from '../../company';

export const UserDetailsDtoMock: UserDetailsDto[] = [
  <UserDetailsDto>{
    id: '',
    name: '',
    email: '',
    company: <CompanyDto>{
      id: '',
      name: '',
      mastrNumber: '',
      companyType: '',
      address: <AddressDto>{
        street: '',
        postalCode: '',
        city: '',
        state: '',
        country: '',
      },
      users: [],
    },
  },
];
