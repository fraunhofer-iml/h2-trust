import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, UserMessagePatterns } from '@h2-trust/amqp';
import { UserDetailsDto, UserDto, USERS } from '@h2-trust/api';

@Injectable()
export class UserService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  readRecipients(): UserDto[] {
    return USERS;
  }

  readUserWithCompany(id: string): Promise<UserDetailsDto> {
    return firstValueFrom(this.generalService.send(UserMessagePatterns.READ_WITH_COMPANY, { id }));
  }
}
