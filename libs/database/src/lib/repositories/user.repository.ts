import { Injectable } from '@nestjs/common';
import { UserDetailsEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';
import { userWithCompanyResultFields } from '../queries';
import { retrieveRecordOrThrowException } from './utils';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserWithCompany(id: string): Promise<UserDetailsEntity> {
    return this.prismaService.user
      .findUnique({
        where: {
          id: id,
        },
        ...userWithCompanyResultFields,
      })
      .then((result) => retrieveRecordOrThrowException(result, id, 'User'));
  }
}
