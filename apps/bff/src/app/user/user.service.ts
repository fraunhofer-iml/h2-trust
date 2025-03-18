import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AmqpClientEnum, UserMessagePatterns } from '@h2-trust/amqp';
import { UserDetailsDto } from '@h2-trust/api';

@Injectable()
export class UserService {
  constructor(@Inject(AmqpClientEnum.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  readUserWithCompany(id: string): Promise<UserDetailsDto> {
    return firstValueFrom(this.generalService.send(UserMessagePatterns.READ_WITH_COMPANY, { id }));
  }
}
