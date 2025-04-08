import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserDetailsEntity, UserMessagePatterns } from '@h2-trust/amqp';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly service: UserService) {}

  @MessagePattern(UserMessagePatterns.READ_WITH_COMPANY)
  async readUserWithCompany(@Payload() payload: { id: string }): Promise<UserDetailsEntity> {
    return this.service.readUserWithCompany(payload.id);
  }
}
