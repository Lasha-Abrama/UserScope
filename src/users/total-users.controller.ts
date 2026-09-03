import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TotalUsers, UserStats, UsersService } from './users.service.js';

@ApiTags('users')
@Controller()
export class TotalUsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Count all users' })
  @Get('total-users')
  getTotalUsers(): Promise<TotalUsers> {
    return this.usersService.getTotalUsers();
  }

  @ApiOperation({ summary: 'Get dashboard user statistics' })
  @Get('stats')
  getStats(): Promise<UserStats> {
    return this.usersService.getStats();
  }
}
