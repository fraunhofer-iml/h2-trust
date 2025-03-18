import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UserDetailsDto } from '@h2-trust/api';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id/details')
  @ApiOperation({ description: 'Get user and his company' })
  @ApiOkResponse({ description: 'Successful request.' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user',
    example: 'user-hydrogen',
  })
  getUserDetails(@Param('id') id: string): Promise<UserDetailsDto> {
    return this.userService.readUserWithCompany(id);
  }
}
