import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserDetailsDto } from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private readonly httpClient: HttpClient, private readonly authService: AuthService) {}

  getUserAccountInformation(userId: string) {
    return this.httpClient.get<UserDetailsDto>(
      `${BASE_URL}${ApiEndpoints.users.getUser}/${userId}${ApiEndpoints.users.userDetails}`,
    );
  }
}
