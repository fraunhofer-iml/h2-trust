import { CompanySeed } from 'libs/database/src/seed';
import { AddressEntityHydrogenMock, AddressEntityPowerMock, AddressEntityRecipientMock } from '../../address/mocks';
import { CompanyEntity } from '../company.entity';

export const CompanyEntityPowerMock: CompanyEntity = new CompanyEntity(
  CompanySeed[0].id,
  CompanySeed[0].name,
  CompanySeed[0].mastrNumber,
  CompanySeed[0].companyType,
  AddressEntityPowerMock,
  [],
);
export const CompanyEntityHydrogenMock: CompanyEntity = new CompanyEntity(
  CompanySeed[1].id,
  CompanySeed[1].name,
  CompanySeed[1].mastrNumber,
  CompanySeed[1].companyType,
  AddressEntityHydrogenMock,
  [],
);
export const CompanyEntityRecipientMock: CompanyEntity = new CompanyEntity(
  CompanySeed[2].id,
  CompanySeed[2].name,
  CompanySeed[2].mastrNumber,
  CompanySeed[2].companyType,
  AddressEntityRecipientMock,
  [],
);
