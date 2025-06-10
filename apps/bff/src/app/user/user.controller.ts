import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UserDetailsDto } from '@h2-trust/api';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ description: 'Get user and his company' })
  @ApiOkResponse({ description: 'Successful request.' })
  @ApiResponse({ type: [UserDetailsDto] })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user',
    example: '6f63a1a9-6cc5-4a7a-98b2-79a0460910f4',
  })
  getUserDetails(@Param('id') id: string): Promise<UserDetailsDto> {
    return this.userService.readUserWithCompany(id);
  }
}
