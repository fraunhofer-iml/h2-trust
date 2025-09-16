/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserDbType } from 'libs/database/src/lib/types';

export class UserEntity {
  id?: string;
  name?: string;
  email?: string;

  constructor(id: string, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  static fromDatabase(user: UserDbType): UserEntity {
    return <UserEntity>{
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
