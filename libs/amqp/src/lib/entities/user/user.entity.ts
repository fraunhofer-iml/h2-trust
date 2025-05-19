// eslint-disable-next-line @nx/enforce-module-boundaries
import { UserDbType } from '@h2-trust/database';

export class UserEntity {
  id?: string;
  name?: string;
  email?: string;

  constructor(id: string, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  static fromDatabase(user: UserDbType): UserEntity {
    return <UserEntity>{
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
