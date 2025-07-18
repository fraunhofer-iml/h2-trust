import { UserSeed } from 'libs/database/src/seed';
import { UserEntity } from '../user.entity';

export const UserEntityPowerMock: UserEntity = new UserEntity(UserSeed[0].id, UserSeed[0].name, UserSeed[0].email);

export const UserEntityHydrogenMock: UserEntity = new UserEntity(UserSeed[1].id, UserSeed[1].name, UserSeed[1].email);
