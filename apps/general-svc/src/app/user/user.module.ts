import { Module } from '@nestjs/common';
import { PrismaService } from '@h2-trust/database';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
