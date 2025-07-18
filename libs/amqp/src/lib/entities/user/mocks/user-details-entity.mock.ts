import { UserSeed } from 'libs/database/src/seed';
import { CompanyEntityHydrogenMock, CompanyEntityPowerMock } from '../../company/mocks';
import { UserDetailsEntity } from '../user-details.entity';

export const UserDetailsEntityPowerMock: UserDetailsEntity = new UserDetailsEntity(
  UserSeed[0].id,
  UserSeed[0].name,
  UserSeed[0].email,
  CompanyEntityPowerMock,
);

export const UserDetailsEntityHydrogenMock: UserDetailsEntity = new UserDetailsEntity(
  UserSeed[1].id,
  UserSeed[1].name,
  UserSeed[1].email,
  CompanyEntityHydrogenMock,
);
