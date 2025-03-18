import { Injectable } from '@nestjs/common';
import { UserDetailsDto, userWithCompanyResultFields } from '@h2-trust/api';
import { PrismaService, retrieveEntityOrThrow } from '@h2-trust/database';

// TODO-MP: move prisma calls to database lib
@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async readUserWithCompany(id: string): Promise<UserDetailsDto> {
    return this.prismaService.user
      .findUnique({
        where: {
          id: id,
        },
        ...userWithCompanyResultFields,
      })
      .then((result) => retrieveEntityOrThrow(result, id, 'User'));
  }
}
