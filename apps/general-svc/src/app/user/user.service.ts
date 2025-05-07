import { Injectable } from '@nestjs/common';
import { UserDetailsEntity } from '@h2-trust/amqp';
import { UserRepository } from '@h2-trust/database';

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async readUserWithCompany(id: string): Promise<UserDetailsEntity> {
    return this.repository.findUserWithCompany(id);
  }
}
