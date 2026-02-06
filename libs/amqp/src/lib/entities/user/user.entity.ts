/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserDeepDbType, UserFlatDbType, UserNestedDbType } from 'libs/database/src/lib/types';
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

  static fromDeepDatabase(user: UserDeepDbType): UserEntity {
    return new UserEntity(user.id, user.name, user.email, CompanyEntity.fromNestedDatabase(user.company));
  }

  static fromNestedDatabase(user: UserNestedDbType): UserEntity {
    return new UserEntity(user.id, user.name, user.email, CompanyEntity.fromFlatDatabase(user.company));
  }

  static fromFlatDatabase(user: UserFlatDbType): UserEntity {
    return new UserEntity(user.id, user.name, user.email, CompanyEntity.fromBaseType(user.company));
  }
}
