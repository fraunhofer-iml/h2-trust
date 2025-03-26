import { CompanyDto } from '../company';
import { AddressDto } from '../other';
import { UserDetailsDto } from '../user';

export const USERDETAILSDTOMOCK = new UserDetailsDto(
  '',
  '',
  '',
  new CompanyDto('', '', '', '', '', new AddressDto('', '', '', '', ''), []),
);
