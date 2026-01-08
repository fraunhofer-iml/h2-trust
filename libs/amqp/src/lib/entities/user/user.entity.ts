/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserDbType } from 'libs/database/src/lib/types';
import { CompanyEntity } from '../company';

export class UserEntity {
  id: string;
  name: string;
  email: string;
  company: CompanyEntity;

  constructor(id: string, name: string, email: string, company: CompanyEntity) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.company = company;
  }

  static fromDatabase(user: UserDbType): UserEntity {
    return new UserEntity(user.id, user.name, user.email, CompanyEntity.fromDatabase(user.company));
  }
}
