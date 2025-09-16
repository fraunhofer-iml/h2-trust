/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UserDetailsDto } from '@h2-trust/api';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve a user with its company information by its ID.',
  })
  @ApiOkResponse({
    description: 'Returns the requested user with its company information.',
    type: UserDetailsDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user.',
    example: '6f63a1a9-6cc5-4a7a-98b2-79a0460910f4',
  })
  readUserWithCompany(@Param('id') id: string): Promise<UserDetailsDto> {
    return this.userService.readUserWithCompany(id);
  }
}
