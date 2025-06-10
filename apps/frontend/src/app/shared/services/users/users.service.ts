import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserDetailsDto } from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Injectable()
export class UsersService {
  constructor(private readonly httpClient: HttpClient) {}

  getUserAccountInformation(userId: string) {
    return lastValueFrom(this.httpClient.get<UserDetailsDto>(`${BASE_URL}${ApiEndpoints.users.getUsers}/${userId}`));
  }
}
