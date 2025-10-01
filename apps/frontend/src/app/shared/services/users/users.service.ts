/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserDetailsDto } from '@h2-trust/api';
import { API } from '../../constants/api-endpoints';

@Injectable()
export class UsersService {
  constructor(private readonly httpClient: HttpClient) {}

  getUserAccountInformation(userId: string) {
    return lastValueFrom(this.httpClient.get<UserDetailsDto>(API.USERS.DETAILS(userId)));
  }
}
